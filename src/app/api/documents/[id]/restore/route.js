import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/database";
import { emailService } from "../../../../../lib/emailService";
import { googleDriveService } from "../../../../../lib/googleDrive";
import { Document } from "../../../../../models/Document";
import { Folder } from "../../../../../models/Folder";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Find the version to restore
    const versionToRestore = await Document.findById(id);
    if (!versionToRestore) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Get the parent document ID
    const parentId = versionToRestore.parentDocumentId || versionToRestore._id;

    // Get folder info for Google Drive copy
    const folder = await Folder.findById(versionToRestore.folderId);
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Find all versions of this document
    const allVersions = await Document.find({
      $or: [{ _id: parentId }, { parentDocumentId: parentId }],
    });

    // Get the highest version number
    const maxVersion = Math.max(...allVersions.map((v) => v.version));

    // Copy the file in Google Drive to avoid duplicate ID issues
    const newFileName = `${versionToRestore.originalName} (Restored v${
      maxVersion + 1
    })`;
    const googleDriveResponse = await googleDriveService.copyFile(
      versionToRestore.googleDriveId,
      newFileName,
      folder.googleDriveFolderId
    );

    // Create a new version with the restored content
    const restoredVersion = new Document({
      name: versionToRestore.name,
      originalName: versionToRestore.originalName,
      mimeType: versionToRestore.mimeType,
      size: versionToRestore.size,
      folderId: versionToRestore.folderId,
      googleDriveId: googleDriveResponse.fileId,
      googleDriveUrl: googleDriveResponse.webViewLink,
      content: versionToRestore.content,
      tags: versionToRestore.tags,
      uploadedBy: versionToRestore.uploadedBy,
      version: maxVersion + 1,
      isLatestVersion: true,
      isActive: true,
      parentDocumentId: parentId,
      versionHistory: [],
    });

    await restoredVersion.save();

    // Update all previous versions to not be the latest (excluding the new restored version)
    await Document.updateMany(
      {
        $or: [{ _id: parentId }, { parentDocumentId: parentId }],
        _id: { $ne: restoredVersion._id }, // Exclude the new restored version from being set to false
      },
      { isLatestVersion: false }
    );

    // Add to version history for all related documents
    const versionHistoryEntry = {
      version: maxVersion + 1,
      documentId: restoredVersion._id,
      uploadedAt: new Date(),
      uploadedBy: versionToRestore.uploadedBy,
    };

    await Document.updateMany(
      {
        $or: [{ _id: parentId }, { parentDocumentId: parentId }],
      },
      { $push: { versionHistory: versionHistoryEntry } }
    );

    // Also add to the restored version's history
    await Document.findByIdAndUpdate(restoredVersion._id, {
      $push: { versionHistory: versionHistoryEntry },
    });

    // Send email notifications to document creators and collaborators
    try {
      // Get all users who have interacted with this document
      const allVersions = await Document.find({
        $or: [{ _id: parentId }, { parentDocumentId: parentId }],
      });

      // Create a set of unique users to notify
      const usersToNotify = new Set();

      // Add all version uploaders (excluding the current user)
      allVersions.forEach((version) => {
        if (
          version.uploadedBy?.email &&
          version.uploadedBy.email !== versionToRestore.uploadedBy.email
        ) {
          usersToNotify.add({
            email: version.uploadedBy.email,
            name: version.uploadedBy.name || "User",
          });
        }
      });

      // Send email notifications
      const emailPromises = Array.from(usersToNotify).map(async (recipient) => {
        try {
          await emailService.sendVersionUpdateNotification({
            documentName: versionToRestore.name,
            originalName: versionToRestore.originalName,
            versionNumber: maxVersion + 1,
            uploadedBy: {
              name: versionToRestore.uploadedBy.name,
              email: versionToRestore.uploadedBy.email,
            },
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            documentUrl: restoredVersion.googleDriveUrl,
            changeType: "version_restore",
          });
        } catch (emailError) {
          console.error(
            `Failed to send email to ${recipient.email}:`,
            emailError
          );
        }
      });

      // Wait for all emails to be sent (but don't block the response)
      Promise.all(emailPromises).catch((error) => {
        console.error("Some email notifications failed:", error);
      });
    } catch (emailError) {
      console.error("Email notification setup failed:", emailError);
      // Don't fail the restore if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Version ${maxVersion + 1} restored successfully`,
      document: {
        id: restoredVersion._id,
        name: restoredVersion.name,
        version: restoredVersion.version,
        googleDriveUrl: restoredVersion.googleDriveUrl,
      },
    });
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
