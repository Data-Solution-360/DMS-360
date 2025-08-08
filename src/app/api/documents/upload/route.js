import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import {
  DocumentService,
  UserService,
} from "../../../../lib/services/index.js";

// Helper function to get document collaborators for new documents
async function getDocumentCollaborators(document) {
  const collaborators = [];

  try {
    // For new documents, we only have the creator
    if (document.createdBy) {
      const creator = await UserService.getUserById(document.createdBy);
      if (creator && creator.email) {
        collaborators.push({
          id: creator.id,
          name: creator.name,
          email: creator.email,
          role: "creator",
        });
      }
    }

    // If document is in a folder, could add folder collaborators here
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

    console.log(
      `[Collaborators] Final collaborator list:`,
      collaborators.map((c) => ({ name: c.name, email: c.email }))
    );

    return collaborators;
  } catch (error) {
    console.error("Error getting collaborators:", error);
    return collaborators;
  }
}

// POST - Save document metadata after client-side upload
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      // Parse the request body (JSON, not form data)
      const body = await request.json();

      const {
        fileName,
        originalName,
        mimeType,
        size,
        folderId,
        firebaseStorageUrl,
        firebaseStoragePath,
        description = "",
        tags = [],
        department = "",
        documentType = "",
        priority = "medium",
        author = "",
        confidentiality = "internal",
        version = "",
      } = body;

      // Validate required fields
      if (!fileName || !firebaseStorageUrl || !firebaseStoragePath) {
        return NextResponse.json(
          { success: false, error: "Missing required upload data" },
          { status: 400 }
        );
      }

      // Create document record in Firestore
      const documentData = {
        name: fileName,
        originalName: originalName || fileName,
        mimeType: mimeType,
        size: size,
        folderId: folderId || null,
        firebaseStorageUrl: firebaseStorageUrl,
        firebaseStoragePath: firebaseStoragePath,
        content: description,
        tags: Array.isArray(tags) ? tags : [], // Store tag IDs only
        department: department,
        documentType: documentType,
        priority: priority,
        author: author,
        confidentiality: confidentiality,
        version: version || "1",
        createdBy: request.user.user.id, // Store only user ID
        isLatestVersion: true,
        isActive: true,
      };

      const document = await DocumentService.createDocument(documentData);

      // Get document collaborators for email notifications
      try {
        const collaborators = await getDocumentCollaborators(document);
        const uploaderInfo = {
          name: request.user.user.name,
          email: request.user.user.email,
        };

        console.log(
          `[Upload] Sending emails to ${collaborators.length} collaborators`
        );

        // Send email notifications to collaborators with enhanced data
        const emailPromises = collaborators.map(async (collaborator) => {
          if (collaborator.email !== uploaderInfo.email) {
            // Don't email the uploader
            try {
              console.log(`[Upload] Sending email to: ${collaborator.email}`);

              const emailResult =
                await emailService.sendDocumentCreatedNotification({
                  documentName: document.name,
                  uploadedBy: uploaderInfo,
                  recipientEmail: collaborator.email,
                  recipientName: collaborator.name,
                  documentUrl: `${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/dashboard`,
                  fileSize: size,
                  mimeType: mimeType,
                  tags: tags || [],
                  department: department || "",
                  description: description,
                });

              console.log(
                `[Upload] Email result for ${collaborator.email}:`,
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
              `[Upload] Skipping email to uploader: ${collaborator.email}`
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
          `[Upload] Email notification summary: ${successful} sent, ${failed} failed, ${skipped} skipped`
        );
      } catch (emailError) {
        console.error("Upload email notification error:", emailError);
        // Don't fail the upload if email fails
      }

      return NextResponse.json({
        success: true,
        data: document,
        message: "Document saved successfully",
      });
    } catch (error) {
      console.error("Save document error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to save document" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
