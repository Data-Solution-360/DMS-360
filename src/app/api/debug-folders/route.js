import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/database";
import { Folder } from "../../../../models/Folder";

export async function GET() {
  try {
    await connectDB();

    const allFolders = await Folder.find({}).lean();

    // Convert to plain objects and show data types
    const debugFolders = allFolders.map((folder) => ({
      _id: folder._id,
      _idType: typeof folder._id,
      _idString: folder._id.toString(),
      name: folder.name,
      parentId: folder.parentId,
      parentIdType: typeof folder.parentId,
      parentIdString: folder.parentId ? folder.parentId.toString() : null,
      path: folder.path,
      level: folder.level,
    }));

    return NextResponse.json({
      success: true,
      data: {
        folders: debugFolders,
        totalCount: debugFolders.length,
        rootFolders: debugFolders.filter(
          (f) => !f.parentId || f.parentId === null
        ),
        childFolders: debugFolders.filter(
          (f) => f.parentId && f.parentId !== null
        ),
      },
    });
  } catch (error) {
    console.error("Debug folders error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
