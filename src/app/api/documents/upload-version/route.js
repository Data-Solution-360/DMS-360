import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { DocumentService, UserService } from "../../../../lib/services/index.js";

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

// POST - Save version metadata after client-side upload (like regular document upload)
export async function POST(request) {
  return requireAuth(async (request) => {
    try {
      // Parse JSON body (like regular document upload)
      const body = await request.json();

      const {
        documentId,
        fileName,
        originalName,
        mimeType,
        size,
        firebaseStorageUrl,
        firebaseStoragePath,
        description = "",
        version,
      } = body;

      // Validate required fields
      if (!documentId) {
        return NextResponse.json(
          { success: false, error: "Document ID is required" },
          { status: 400 }
        );
      }

      if (!fileName || !firebaseStorageUrl || !firebaseStoragePath) {
        return NextResponse.json(
          { success: false, error: "Missing required upload data" },
          { status: 400 }
        );
      }

      // Get the original document
      const originalDocument = await DocumentService.getDocumentById(
        documentId
      );
      if (!originalDocument) {
        return NextResponse.json(
          { success: false, error: "Original document not found" },
          { status: 404 }
        );
      }

      // Get user info from auth
      const user = request.user;
      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not authenticated" },
          { status: 401 }
        );
      }

      // Generate new version number if not provided
      let newVersion = version;
      if (!newVersion) {
        const existingVersions = await DocumentService.getDocumentVersions(
          documentId
        );
        const maxVersion = Math.max(
          ...existingVersions.map((v) => v.version || 1),
          originalDocument.version || 1
        );
        newVersion = maxVersion + 1;
      }

      // Create version document data (similar to regular document structure)
      const versionData = {
        name: fileName,
        originalName: originalName || fileName,
        mimeType: mimeType,
        size: size,
        folderId: originalDocument.folderId,
        firebaseStorageUrl: firebaseStorageUrl,
        firebaseStoragePath: firebaseStoragePath,
        content: description,
        // Fix: Always set originalDocumentId to the root/original document
        originalDocumentId:
          originalDocument.originalDocumentId || originalDocument.id,
        // Fix: parentDocumentId should point to the immediate previous version (the current document)
        parentDocumentId: documentId,
        version: newVersion,
        description: description,
        createdBy: user.user?.id || user.uid, // Store only user ID
        isLatestVersion: true,
        isActive: true,
        // Copy metadata from original (store only IDs)
        tags: originalDocument.tags || [], // Store tag IDs only
        department: originalDocument.department || "",
        documentType: originalDocument.documentType || "",
        priority: originalDocument.priority || "medium",
        author: originalDocument.author || "",
        confidentiality: originalDocument.confidentiality || "internal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create the new version document
      const newVersionDoc = await DocumentService.createDocument(versionData);

      // Convert any remaining Firestore timestamps in the response
      const cleanResponse = {
        ...newVersionDoc,
        createdAt:
          newVersionDoc.createdAt instanceof Date
            ? newVersionDoc.createdAt.toISOString()
            : newVersionDoc.createdAt,
        updatedAt:
          newVersionDoc.updatedAt instanceof Date
            ? newVersionDoc.updatedAt.toISOString()
            : newVersionDoc.updatedAt,
      };

      // Update original document to mark as not latest version
      await DocumentService.updateDocument(documentId, {
        isLatestVersion: false,
        updatedBy: user.user?.id || user.uid,
        updatedByName: user.user?.name || user.displayName,
        updatedAt: new Date().toISOString(),
      });

      // Update all other versions to not be latest
      const allVersions = await DocumentService.getDocumentVersions(documentId);
      for (const versionDoc of allVersions) {
        if (versionDoc.id !== newVersionDoc.id) {
          await DocumentService.updateDocument(versionDoc.id, {
            isLatestVersion: false,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Get document collaborators for email notifications
      try {
        const collaborators = await getDocumentCollaborators(originalDocument);
        const uploaderInfo = {
          name: user.user?.name || user.displayName,
          email: user.user?.email || user.email,
        };

        console.log(
          `[Upload Version] Sending emails to ${collaborators.length} collaborators`
        );

        // Send email notifications to collaborators with enhanced data
        const emailPromises = collaborators.map(async (collaborator) => {
          if (collaborator.email !== uploaderInfo.email) {
            // Don't email the uploader
            try {
              console.log(
                `[Upload Version] Sending email to: ${collaborator.email}`
              );

              // Assuming emailService is no longer imported, this part will need to be removed or replaced
              // For now, commenting out the email sending logic as emailService is removed.
              // const emailResult =
              //   await emailService.sendVersionUpdateNotification({
              //     documentName: originalDocument.name,
              //     originalName:
              //       originalDocument.originalName || originalDocument.name,
              //     versionNumber: newVersion,
              //     uploadedBy: uploaderInfo,
              //     recipientEmail: collaborator.email,
              //     recipientName: collaborator.name,
              //     documentUrl: `${
              //       process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              //     }/dashboard`,
              //     changeType: "version_upload",
              //     description: description,
              //     fileSize: size,
              //     mimeType: mimeType,
              //     tags: originalDocument.tags || [],
              //     department: originalDocument.department || "",
              //   });

              // console.log(
              //   `[Upload Version] Email result for ${collaborator.email}:`,
              //   emailResult
              // );
              return { success: true, skipped: true, recipient: collaborator.email };
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
              `[Upload Version] Skipping email to uploader: ${collaborator.email}`
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
          `[Upload Version] Email notification summary: ${successful} sent, ${failed} failed, ${skipped} skipped`
        );
      } catch (emailError) {
        console.error("Upload version email notification error:", emailError);
        // Don't fail the upload if email fails
      }

      return NextResponse.json({
        success: true,
        data: cleanResponse,
        message: "Version uploaded successfully",
        version: newVersion,
      });
    } catch (error) {
      console.error("Upload version error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload version",
          details: error.message,
        },
        { status: 500 }
      );
    }
  })(request);
}
