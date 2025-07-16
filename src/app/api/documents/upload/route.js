import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { googleDriveService } from "../../../../lib/googleDrive";
import { connectDB } from "../../../../lib/mongodb";
import { Document } from "../../../../models/Document";

// Helper function to verify JWT token
async function verifyToken(request) {
  try {
    // Get token from cookie
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function POST(request) {
  try {
    // Check for Google OAuth access token
    const googleAccessToken = request.cookies.get("google_access_token")?.value;

    if (!googleAccessToken) {
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

    // Set the access token for Google Drive service
    googleDriveService.setAccessToken(googleAccessToken);

    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse form data using Next.js built-in FormData
    const formData = await request.formData();

    const file = formData.get("file");
    const folderId = formData.get("folderId");
    const tags = formData.get("tags");
    const description = formData.get("description") || "";

    if (!file || !file.name) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: "Folder ID is required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);

    // Parse tags if provided
    let parsedTags = [];
    try {
      if (tags) {
        parsedTags = JSON.parse(tags);
      }
    } catch (error) {
      console.warn("Failed to parse tags:", error);
    }

    // Upload to Google Drive using the environment variable folder ID
    const driveFile = await googleDriveService.uploadFile(
      fileBuffer,
      file.name,
      file.type,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    // Create document in MongoDB
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
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
