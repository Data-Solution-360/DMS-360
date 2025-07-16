import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/database";
import { Folder } from "../../../../models/Folder";

export async function POST(request) {
  try {
    console.log("Starting simple folder creation...");

    await connectDB();
    console.log("Database connected");

    const { name } = await request.json();
    console.log("Received name:", name);

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Create a simple folder without complex path logic
    const folder = new Folder({
      name: name.trim(),
      parentId: null,
      path: name.trim(),
      level: 0,
    });

    console.log("About to save folder:", folder);
    await folder.save();
    console.log("Folder saved successfully");

    return NextResponse.json(
      {
        success: true,
        data: folder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Simple folder creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
