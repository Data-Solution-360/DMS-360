import { NextResponse } from "next/server";
import {
  DocumentService,
  FolderService,
  TagService,
  UserService,
} from "../../../lib/firestore.js";

// GET - Test route for checking Firestore connection
async function GET(request) {
  try {
    // Test all services
    const users = await UserService.getAllUsers();
    const documents = await DocumentService.getAllDocuments();
    const folders = await FolderService.getAllFolders();
    const tags = await TagService.getAllTags();

    return NextResponse.json({
      success: true,
      message: "Firestore connection successful",
      data: {
        users: users.length,
        documents: documents.length,
        folders: folders.length,
        tags: tags.length,
      },
    });
  } catch (error) {
    console.error("Test route error:", error);
    return NextResponse.json(
      { success: false, error: "Firestore connection failed" },
      { status: 500 }
    );
  }
}

export { GET };
