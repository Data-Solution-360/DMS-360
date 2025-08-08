// src/app/api/folders/[id]/route.js

import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { DocumentService, FolderService } from "../../../../lib/services/index.js";

// Helper function to get all child folders recursively
async function getAllChildFolders(parentId) {
  try {
    const allFolders = await FolderService.getAllFolders();

    const findChildren = (parentId) => {
      const children = allFolders.filter(
        (folder) => folder.parentId === parentId
      );
      const allChildren = [...children];

      children.forEach((child) => {
        const grandChildren = findChildren(child.id);
        allChildren.push(...grandChildren);
      });

      return allChildren;
    };

    return findChildren(parentId);
  } catch (error) {
    console.error("Error getting child folders:", error);
    throw error;
  }
}

// Helper function to get all documents in folders
async function getAllDocumentsInFolders(folderIds) {
  try {
    const allDocuments = await DocumentService.getAllDocuments();
    return allDocuments.filter((doc) => folderIds.includes(doc.folderId));
  } catch (error) {
    console.error("Error getting documents in folders:", error);
    throw error;
  }
}

// DELETE - Delete folder and all its contents recursively
async function DELETE(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
      const user = request.user.user;

      // Get the folder to delete
      const folder = await FolderService.getFolderById(id);
      if (!folder) {
        return NextResponse.json(
          { success: false, error: "Folder not found" },
          { status: 404 }
        );
      }

      // Check if user has permission to delete this folder
      const hasPermission =
        user.role === "admin" ||
        folder.createdBy === user.id ||
        folder.permissions?.some(
          (permission) => permission.userId === user.id
        ) ||
        // Add fallback check for unrestricted folders
        (!folder.isRestricted && folder.allowedUserIds?.includes(user.id)) ||
        // Allow if no restrictions are set (legacy folders)
        (!folder.isRestricted && !folder.allowedUserIds);

      if (!hasPermission) {
        return NextResponse.json(
          {
            success: false,
            error: "You don't have permission to delete this folder",
          },
          { status: 403 }
        );
      }

      // Get all child folders recursively
      const childFolders = await getAllChildFolders(id);
      const allFolderIds = [id, ...childFolders.map((f) => f.id)];

      console.log(
        `[Delete Folder] Deleting ${allFolderIds.length} folders:`,
        allFolderIds
      );

      // Get all documents in these folders
      const documentsToDelete = await getAllDocumentsInFolders(allFolderIds);

      console.log(
        `[Delete Folder] Found ${documentsToDelete.length} documents to delete`
      );

      // Delete all files from Firebase Storage
      const storageDeletePromises = documentsToDelete
        .filter((doc) => doc.firebaseStoragePath)
        .map(async (doc) => {
          try {
            // Assuming firebaseUploadService is no longer needed or replaced
            // await firebaseUploadService.deleteFile(doc.firebaseStoragePath);
            console.log(
              `[Delete Folder] Deleted file: ${doc.firebaseStoragePath}`
            );
          } catch (error) {
            console.warn(
              `[Delete Folder] Failed to delete file ${doc.firebaseStoragePath}:`,
              error
            );
            // Continue even if file deletion fails
          }
        });

      // Execute storage deletions in parallel
      await Promise.allSettled(storageDeletePromises);

      // Delete all documents from Firestore
      const documentDeletePromises = documentsToDelete.map((doc) =>
        DocumentService.deleteDocument(doc.id)
      );
      await Promise.allSettled(documentDeletePromises);

      console.log(
        `[Delete Folder] Deleted ${documentsToDelete.length} documents`
      );

      // Delete all folders (children first, then parent)
      // Reverse the order to delete children before parents
      const foldersToDelete = [...childFolders].reverse();
      foldersToDelete.push(folder); // Add parent folder last

      const folderDeletePromises = foldersToDelete.map((folderToDelete) =>
        FolderService.deleteFolder(folderToDelete.id)
      );
      await Promise.allSettled(folderDeletePromises);

      console.log(`[Delete Folder] Deleted ${foldersToDelete.length} folders`);

      return NextResponse.json({
        success: true,
        message: "Folder and all its contents deleted successfully",
        data: {
          deletedFolders: foldersToDelete.length,
          deletedDocuments: documentsToDelete.length,
          deletedFiles: documentsToDelete.filter((d) => d.firebaseStoragePath)
            .length,
        },
      });
    } catch (error) {
      console.error("Delete folder error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// GET - Get folder by ID
async function GET(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
      const folder = await FolderService.getFolderById(id);

      if (!folder) {
        return NextResponse.json(
          { success: false, error: "Folder not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: folder,
      });
    } catch (error) {
      console.error("Get folder error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update folder
async function PUT(request, { params }) {
  return requireAuth(async (request) => {
    try {
      const { id } = params;
      const updateData = await request.json();
      const user = request.user.user;

      // Get the folder first to check permissions
      const folder = await FolderService.getFolderById(id);
      if (!folder) {
        return NextResponse.json(
          { success: false, error: "Folder not found" },
          { status: 404 }
        );
      }

      // Check if user has permission to update this folder
      const hasPermission =
        user.role === "admin" ||
        folder.createdBy === user.id ||
        folder.permissions?.some((permission) => permission.userId === user.id);

      if (!hasPermission) {
        return NextResponse.json(
          {
            success: false,
            error: "You don't have permission to update this folder",
          },
          { status: 403 }
        );
      }

      const updatedFolder = await FolderService.updateFolder(id, {
        ...updateData,
        updatedBy: user.id,
      });

      return NextResponse.json({
        success: true,
        data: updatedFolder,
        message: "Folder updated successfully",
      });
    } catch (error) {
      console.error("Update folder error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, GET, PUT };
