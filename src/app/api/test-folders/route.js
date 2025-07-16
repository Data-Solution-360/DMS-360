import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Test folders endpoint called");

    // Return some test data
    const testFolders = [
      {
        id: "test-folder-1",
        name: "Test Folder 1",
        parentId: null,
        path: "test-folder-1",
        level: 0,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "test-folder-2",
        name: "Test Folder 2",
        parentId: null,
        path: "test-folder-2",
        level: 0,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "test-subfolder-1",
        name: "Subfolder 1",
        parentId: "test-folder-1",
        path: "test-folder-1/subfolder-1",
        level: 1,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "test-subfolder-2",
        name: "Subfolder 2",
        parentId: "test-folder-1",
        path: "test-folder-1/subfolder-2",
        level: 1,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: testFolders,
      message: "Test folders loaded successfully",
    });
  } catch (error) {
    console.error("Test folders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
