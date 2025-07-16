import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { googleDriveService } from "../../../lib/googleDrive";
import { connectDB } from "../../../lib/mongodb";
import { Document } from "../../../models/Document";

// Helper function to verify JWT token
async function verifyToken(request) {
  try {
    const token = request.cookies.get("token")?.value;
    console.log("🔍 Token found:", !!token);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Token decoded successfully:", {
      userId: decoded.userId,
      email: decoded.email,
    });
    return decoded;
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return null;
  }
}

export async function POST(request) {
  console.log("🚀 Debug upload started");

  try {
    // Step 1: Check environment variables
    console.log("🔍 Environment variables:");
    console.log(
      "- GOOGLE_DRIVE_FOLDER_ID:",
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );
    console.log(
      "- GOOGLE_CLIENT_ID:",
      process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET"
    );
    console.log(
      "- GOOGLE_CLIENT_SECRET:",
      process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET"
    );
    console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");

    // Step 2: Check for Google OAuth access token
    const googleAccessToken = request.cookies.get("google_access_token")?.value;
    console.log("🔍 Google access token found:", !!googleAccessToken);

    if (!googleAccessToken) {
      console.log("❌ No Google access token found");
      return NextResponse.json(
        {
          success: false,
          error: "Google authentication required",
          message:
            "Please authenticate with Google first by visiting /api/auth/google",
        },
        { status: 401 }
      );
    }

    // Step 3: Set the access token for Google Drive service
    googleDriveService.setAccessToken(googleAccessToken);
    console.log("✅ Google access token set");

    // Step 4: Verify authentication
    console.log("🔍 Verifying authentication...");
    const user = await verifyToken(request);
    if (!user) {
      console.log("❌ Authentication failed");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("✅ Authentication successful");

    // Step 5: Connect to database
    console.log("🔍 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected");

    // Step 6: Parse form data
    console.log("🔍 Parsing form data...");
    const formData = await request.formData();

    const file = formData.get("file");
    const folderId = formData.get("folderId");
    const tags = formData.get("tags");
    const description = formData.get("description") || "";

    console.log("🔍 Form data parsed:");
    console.log(
      "- File:",
      file ? { name: file.name, size: file.size, type: file.type } : "NULL"
    );
    console.log("- Folder ID:", folderId);
    console.log("- Tags:", tags);
    console.log("- Description:", description);

    if (!file || !file.name) {
      console.log("❌ No file provided");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!folderId) {
      console.log("❌ No folder ID provided");
      return NextResponse.json(
        { success: false, error: "Folder ID is required" },
        { status: 400 }
      );
    }

    // Step 7: Convert file to buffer
    console.log("🔍 Converting file to buffer...");
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);
    console.log("✅ File buffer created, size:", fileBuffer.length);

    // Step 8: Parse tags
    console.log("🔍 Parsing tags...");
    let parsedTags = [];
    try {
      if (tags) {
        parsedTags = JSON.parse(tags);
        console.log("✅ Tags parsed:", parsedTags);
      }
    } catch (error) {
      console.warn("⚠️ Failed to parse tags:", error);
    }

    // Step 9: Test Google Drive connection first
    console.log("🔍 Testing Google Drive connection...");
    try {
      const testFiles = await googleDriveService.listFiles(
        process.env.GOOGLE_DRIVE_FOLDER_ID,
        1
      );
      console.log(
        "✅ Google Drive connection test successful, files found:",
        testFiles.length
      );
    } catch (error) {
      console.error("❌ Google Drive connection test failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Google Drive connection failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Step 10: Upload to Google Drive
    console.log("🔍 Uploading to Google Drive...");
    console.log("- Folder ID:", process.env.GOOGLE_DRIVE_FOLDER_ID);
    console.log("- File name:", file.name);
    console.log("- File type:", file.type);
    console.log("- Buffer size:", fileBuffer.length);

    const driveFile = await googleDriveService.uploadFile(
      fileBuffer,
      file.name,
      file.type,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    console.log("✅ Google Drive upload successful:", {
      fileId: driveFile.fileId,
      webViewLink: driveFile.webViewLink,
    });

    // Step 11: Create document in MongoDB
    console.log("🔍 Creating document in MongoDB...");
    const document = new Document({
      name: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      folderId,
      googleDriveId: driveFile.fileId,
      googleDriveUrl: driveFile.webViewLink,
      content: description,
      tags: parsedTags,
      uploadedBy: {
        userId: user.userId,
        name: user.name || "Unknown User",
        email: user.email,
      },
      version: 1,
      isLatestVersion: true,
      isActive: true,
    });

    await document.save();
    console.log("✅ Document saved to MongoDB:", document._id);

    // Step 12: Return success
    console.log("🎉 Upload completed successfully!");
    return NextResponse.json({
      success: true,
      data: {
        document: {
          _id: document._id,
          name: document.name,
          originalName: document.originalName,
          mimeType: document.mimeType,
          size: document.size,
          folderId: document.folderId,
          googleDriveId: document.googleDriveId,
          googleDriveUrl: document.googleDriveUrl,
          content: document.content,
          tags: document.tags,
          uploadedBy: document.uploadedBy,
          version: document.version,
          isLatestVersion: document.isLatestVersion,
          isActive: document.isActive,
          createdAt: document.createdAt,
        },
        driveFile: {
          id: driveFile.fileId,
          name: file.name,
          webViewLink: driveFile.webViewLink,
        },
      },
    });
  } catch (error) {
    console.error("💥 Debug upload error:", error);
    console.error("💥 Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
