import { NextResponse } from "next/server";
import { googleDriveService } from "../../../lib/googleDrive";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    console.log("File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);

    console.log("File buffer created, size:", fileBuffer.length);

    // Upload to Google Drive
    const driveFile = await googleDriveService.uploadFile(
      fileBuffer,
      file.name,
      file.type,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    console.log("Upload successful:", driveFile);

    return NextResponse.json({
      success: true,
      message: "Test upload successful",
      file: {
        id: driveFile.fileId,
        name: file.name,
        webViewLink: driveFile.webViewLink,
      },
    });
  } catch (error) {
    console.error("Test upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
