import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/database";
import { emailService } from "../../../../lib/emailService";
import { googleDriveService } from "../../../../lib/googleDrive";
import { Document } from "../../../../models/Document";
import { Folder } from "../../../../models/Folder";
import { User } from "../../../../models/User";

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");
    const documentId = formData.get("documentId");
    const userId = formData.get("userId");

    if (!file || !documentId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the original document
    const originalDocument = await Document.findById(documentId);
    if (!originalDocument) {
      return NextResponse.json(
        { error: "Original document not found" },
        { status: 404 }
      );
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get folder info for Google Drive upload
    const folder = await Folder.findById(originalDocument.folderId);
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Google Drive
    const googleDriveResponse = await googleDriveService.uploadFile(
      buffer,
      file.name,
      file.type,
      folder.googleDriveFolderId
    );

    // Get the latest version number - look for documents with the same parent or the original document
    const latestVersion = await Document.findOne({
      $or: [
        { _id: documentId },
        { parentDocumentId: originalDocument.parentDocumentId || documentId },
      ],
    }).sort({ version: -1 });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Create new version document
    const newVersion = new Document({
      name: originalDocument.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      folderId: originalDocument.folderId,
      googleDriveId: googleDriveResponse.fileId,
      googleDriveUrl: googleDriveResponse.webViewLink,
      content: originalDocument.content,
      tags: originalDocument.tags,
      uploadedBy: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      version: newVersionNumber,
      isLatestVersion: true,
      isActive: true,
      parentDocumentId:
        originalDocument.parentDocumentId || originalDocument._id,
      versionHistory: [],
    });

    await newVersion.save();

    // Update all previous versions to not be the latest (excluding the new version)
    await Document.updateMany(
      {
        $or: [
          { _id: documentId },
          { parentDocumentId: originalDocument.parentDocumentId || documentId },
        ],
        _id: { $ne: newVersion._id }, // Exclude the new version from being set to false
      },
      { isLatestVersion: false }
    );

    // Update version history for all related documents
    const versionHistoryEntry = {
      version: newVersionNumber,
      documentId: newVersion._id,
      uploadedAt: new Date(),
      uploadedBy: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
    };

    await Document.updateMany(
      {
        $or: [
          { _id: documentId },
          { parentDocumentId: originalDocument.parentDocumentId || documentId },
        ],
      },
      { $push: { versionHistory: versionHistoryEntry } }
    );

    // Also add to the new version's history
    await Document.findByIdAndUpdate(newVersion._id, {
      $push: { versionHistory: versionHistoryEntry },
    });

    // Send email notifications to document creators and collaborators
    try {
      // Get all users who have interacted with this document (creators and uploaders)
      const allVersions = await Document.find({
        $or: [
          { _id: documentId },
          { parentDocumentId: originalDocument.parentDocumentId || documentId },
        ],
      }).populate("uploadedBy.userId", "name email");

      // Create a set of unique users to notify
      const usersToNotify = new Set();

      // Add the original document creator
      if (originalDocument.uploadedBy?.email) {
        usersToNotify.add({
          email: originalDocument.uploadedBy.email,
          name: originalDocument.uploadedBy.name || "User",
        });
      }

      // Add all version uploaders
      allVersions.forEach((version) => {
        if (
          version.uploadedBy?.email &&
          version.uploadedBy.email !== user.email
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
            documentName: originalDocument.name,
            originalName: originalDocument.originalName,
            versionNumber: newVersionNumber,
            uploadedBy: {
              name: user.name,
              email: user.email,
            },
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            documentUrl: newVersion.googleDriveUrl,
            changeType: "version_upload",
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
      // Don't fail the upload if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Version ${newVersionNumber} uploaded successfully`,
      document: {
        id: newVersion._id,
        name: newVersion.name,
        version: newVersion.version,
        googleDriveUrl: newVersion.googleDriveUrl,
      },
    });
  } catch (error) {
    console.error("Upload version error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
