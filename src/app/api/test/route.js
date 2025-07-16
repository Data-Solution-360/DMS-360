import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/database";
import { Folder } from "../../../../models/Folder";

export async function GET(request) {
  try {
    await connectDB();

    // Test basic database operations
    const folderCount = await Folder.countDocuments();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      folderCount: folderCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
