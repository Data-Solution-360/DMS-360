import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/database";
import { Document } from "../../../../../models/Document";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Find the document and get its parent ID
    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get the parent document ID (either the document itself or its parent)
    const parentId = document.parentDocumentId || document._id;

    // Find all versions of this document
    const versions = await Document.find({
      $or: [{ _id: parentId }, { parentDocumentId: parentId }],
    })
      .populate("uploadedBy.userId", "name email")
      .sort({ version: -1 });

    return NextResponse.json({
      success: true,
      versions: versions,
    });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
