import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/database";
import { Document } from "../../../../models/Document";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const document = await Document.findById(id).populate(
      "folderId",
      "name path"
    );

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Get document error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { name, tags } = await request.json();

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Update document fields
    if (name) {
      document.name = name;
    }

    if (tags) {
      document.tags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    await document.save();

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Update document error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // TODO: Delete from Google Drive as well
    // await googleDriveService.deleteFile(document.googleDriveId);

    await Document.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
