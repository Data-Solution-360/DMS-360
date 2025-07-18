import { NextResponse } from "next/server";
import { requireDocumentAccess } from "../../../../../lib/auth.js";
import { emailService } from "../../../../../lib/emailService.js";
import { DocumentService, UserService } from "../../../../../lib/firestore.js";

// Helper function to check document ownership
async function checkDocumentOwnership(documentId, userId) {
  try {
    const document = await DocumentService.getDocumentById(documentId);
    return document && document.createdBy === userId;
  } catch (error) {
    console.error("Error checking document ownership:", error);
    return false;
  }
}

// POST - Restore document version (create new version based on previous version)
async function POST(request, { params }) {
  return requireDocumentAccess(async (request) => {
    try {
      const { id } = params;

      // Get the version document to restore
      const versionDocument = await DocumentService.getDocumentById(id);
      if (!versionDocument) {
        return NextResponse.json(
          { success: false, error: "Version document not found" },
          { status: 404 }
        );
      }

      // Check if user can restore this document (only creator or admin)
      const user = request.user.user;
      const canRestore =
        user.role === "admin" ||
        versionDocument.createdBy === user.id ||
        (versionDocument.parentDocumentId &&
          (await checkDocumentOwnership(
            versionDocument.parentDocumentId,
            user.id
          )));

      if (!canRestore) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only restore versions of documents you created",
          },
          { status: 403 }
        );
      }

      // Get the parent document ID (original document)
      const parentDocumentId = versionDocument.parentDocumentId || id;

      // Get all versions to calculate the new version number
      // Use getAllDocumentVersions instead of getDocumentVersions for better accuracy
      const originalDocumentId =
        versionDocument.originalDocumentId || versionDocument.id;
      const allVersions = await DocumentService.getAllDocumentVersions(
        originalDocumentId
      );

      console.log(
        `[Restore] All versions for ${originalDocumentId}:`,
        allVersions.map((v) => ({
          id: v.id,
          version: v.version,
          isLatestVersion: v.isLatestVersion,
        }))
      );

      // Calculate the next version number
      const maxVersion = allVersions.reduce(
        (max, v) => Math.max(max, parseInt(v.version) || 1),
        0
      );
      const newVersionNumber = maxVersion + 1;

      console.log(
        `[Restore] Current max version: ${maxVersion}, New version will be: ${newVersionNumber}`
      );

      // Create a new version based on the version being restored
      const restoredVersionData = {
        name: versionDocument.originalName,
        originalName: versionDocument.originalName,
        mimeType: versionDocument.mimeType,
        size: versionDocument.size,
        folderId: versionDocument.folderId,
        firebaseStorageUrl: versionDocument.firebaseStorageUrl,
        firebaseStoragePath: versionDocument.firebaseStoragePath,
        content: versionDocument.content,
        description: `Restored from version ${versionDocument.version}`,
        tags: versionDocument.tags || [],
        department: versionDocument.department,
        documentType: versionDocument.documentType,
        priority: versionDocument.priority,
        author: versionDocument.author,
        confidentiality: versionDocument.confidentiality,
        createdBy: request.user.user.id,
        createdByEmail: request.user.user.email,
        createdByName: request.user.user.name,
        version: newVersionNumber,
        isLatestVersion: true,
        isActive: true,
        // originalDocumentId is always set to the root/original document
        originalDocumentId: originalDocumentId,
        // parentDocumentId should point to the immediate previous version (the current latest)
        parentDocumentId: parentDocumentId,
        versionHistory: {
          uploadedAt: new Date().toISOString(),
          uploadedBy: {
            id: request.user.user.id,
            name: request.user.user.name,
            email: request.user.user.email,
          },
          description: `Restored from version ${versionDocument.version}`,
          previousVersion: maxVersion,
          restoredFromVersion: versionDocument.version,
        },
      };

      const newVersion = await DocumentService.createDocument(
        restoredVersionData
      );

      // Update all previous versions to not be latest
      // Use getAllDocumentVersions to get all versions to update
      const allVersionsToUpdate = await DocumentService.getAllDocumentVersions(
        originalDocumentId
      );
      const updatePromises = allVersionsToUpdate.map(async (version) => {
        if (version.id !== newVersion.id) {
          await DocumentService.updateDocument(version.id, {
            isLatestVersion: false,
          });
        }
      });

      await Promise.allSettled(updatePromises);

      // Set the new restored version as latest
      await DocumentService.updateDocument(newVersion.id, {
        isLatestVersion: true,
      });

      // Get document collaborators for email notifications
      try {
        const collaborators = await getDocumentCollaborators(versionDocument);
        const restorerInfo = {
          name: request.user.user.name,
          email: request.user.user.email,
        };

        console.log(
          `[Restore] Sending emails to ${collaborators.length} collaborators`
        );

        // Send email notifications to collaborators with enhanced data
        const emailPromises = collaborators.map(async (collaborator) => {
          if (collaborator.email !== restorerInfo.email) {
            // Don't email the restorer
            try {
              console.log(`[Restore] Sending email to: ${collaborator.email}`);

              const emailResult =
                await emailService.sendVersionUpdateNotification({
                  documentName: versionDocument.name,
                  originalName: versionDocument.originalName,
                  versionNumber: newVersionNumber,
                  uploadedBy: restorerInfo,
                  recipientEmail: collaborator.email,
                  recipientName: collaborator.name,
                  documentUrl: `${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/dashboard`,
                  changeType: "version_restore",
                  restoredFromVersion: versionDocument.version,
                  description: `Restored from version ${versionDocument.version}`,
                  fileSize: versionDocument.size,
                  mimeType: versionDocument.mimeType,
                  tags: versionDocument.tags || [],
                  department: versionDocument.department || "",
                });

              console.log(
                `[Restore] Email result for ${collaborator.email}:`,
                emailResult
              );
              return emailResult;
            } catch (emailError) {
              console.error(
                `Failed to send email to ${collaborator.email}:`,
                emailError
              );
              return {
                success: false,
                error: emailError.message,
                recipient: collaborator.email,
              };
            }
          } else {
            console.log(
              `[Restore] Skipping email to restorer: ${collaborator.email}`
            );
            return {
              success: true,
              skipped: true,
              recipient: collaborator.email,
            };
          }
        });

        const emailResults = await Promise.allSettled(emailPromises);

        // Log email results
        const successful = emailResults.filter(
          (r) => r.status === "fulfilled" && r.value.success
        ).length;
        const failed = emailResults.filter(
          (r) =>
            r.status === "rejected" ||
            (r.status === "fulfilled" && !r.value.success)
        ).length;
        const skipped = emailResults.filter(
          (r) => r.status === "fulfilled" && r.value.skipped
        ).length;

        console.log(
          `[Restore] Email notification summary: ${successful} sent, ${failed} failed, ${skipped} skipped`
        );
      } catch (emailError) {
        console.error("Restore email notification error:", emailError);
        // Don't fail the restore if email fails
      }

      return NextResponse.json({
        success: true,
        data: newVersion,
        message: `Version ${versionDocument.version} restored as version ${newVersionNumber}`,
      });
    } catch (error) {
      console.error("Restore version error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// Helper function to get document collaborators
async function getDocumentCollaborators(document) {
  const collaborators = [];

  try {
    // Get the originalDocumentId to find all versions
    const originalDocumentId = document.originalDocumentId || document.id;

    // Get all versions of this document to find all participants
    const allVersions = await DocumentService.getAllDocumentVersions(
      originalDocumentId
    );

    console.log(
      `[Collaborators] Found ${allVersions.length} versions for document ${originalDocumentId}`
    );

    // Collect all unique users who participated in versioning
    const uniqueUserIds = new Set();

    allVersions.forEach((version) => {
      if (version.createdBy) {
        uniqueUserIds.add(version.createdBy);
      }
    });

    console.log(
      `[Collaborators] Unique user IDs found:`,
      Array.from(uniqueUserIds)
    );

    // Get user details for each unique participant
    const userPromises = Array.from(uniqueUserIds).map(async (userId) => {
      try {
        const user = await UserService.getUserById(userId);
        if (user && user.email) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: "participant",
          };
        }
      } catch (error) {
        console.error(`[Collaborators] Error getting user ${userId}:`, error);
      }
      return null;
    });

    const users = await Promise.allSettled(userPromises);

    // Filter out failed user lookups and add to collaborators
    users.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        collaborators.push(result.value);
      }
    });

    // Also add folder collaborators if document is in a folder
    if (document.folderId) {
      try {
        // Get folder permissions (if you have folder collaboration features)
        // This is a placeholder for future implementation
        console.log(
          `[Collaborators] Document is in folder ${document.folderId}, could add folder collaborators here`
        );
      } catch (error) {
        console.error(
          "[Collaborators] Error getting folder collaborators:",
          error
        );
      }
    }

    // Remove duplicates based on email (just in case)
    const uniqueCollaborators = collaborators.filter(
      (collab, index, self) =>
        index === self.findIndex((c) => c.email === collab.email)
    );

    console.log(
      `[Collaborators] Final collaborator list:`,
      uniqueCollaborators.map((c) => ({ name: c.name, email: c.email }))
    );

    return uniqueCollaborators;
  } catch (error) {
    console.error("Error getting collaborators:", error);
    return collaborators;
  }
}

export { POST };
