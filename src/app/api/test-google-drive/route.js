import { NextResponse } from "next/server";
import { googleDriveService } from "../../../lib/googleDrive";

export async function GET() {
  try {
    // Test if we can list files in the folder
    const files = await googleDriveService.listFiles(
      process.env.GOOGLE_DRIVE_FOLDER_ID,
      5
    );

    return NextResponse.json({
      success: true,
      message: "Google Drive connection successful",
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      filesCount: files.length,
      files: files.map((f) => ({ id: f.id, name: f.name })),
    });
  } catch (error) {
    console.error("Google Drive test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      },
      { status: 500 }
    );
  }
}
