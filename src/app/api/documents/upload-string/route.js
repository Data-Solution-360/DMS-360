import { NextResponse } from "next/server";
import { requireDocumentAccess } from "../../../../lib/auth.js";
import { emailService } from "../../../../lib/emailService.js";
import { DocumentService, UserService } from "../../../../lib/firestore.js";

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

// POST - Upload document as string content
async function POST(request) {
  return requireDocumentAccess(async (request) => {
    try {
      const { name, content, folderId, tags = [] } = await request.json();

      if (!name || !content) {
        return NextResponse.json(
          { success: false, error: "Name and content are required" },
          { status: 400 }
        );
      }

      // Create document record in Firestore
      const documentData = {
        name: name,
        originalName: name,
        mimeType: "text/plain",
        size: content.length,
        folderId: folderId,
        firebaseStorageUrl: "", // No file storage for string content
        firebaseStoragePath: "",
        content: content,
        tags: tags,
        createdBy: request.user.userId,
        createdByEmail: request.user.email,
        createdByName: request.user.name,
        version: 1,
        isLatestVersion: true,
        isActive: true,
      };

      const document = await DocumentService.createDocument(documentData);

      // Get document collaborators for email notifications
      try {
        const collaborators = await getDocumentCollaborators(document);
        const uploaderInfo = {
          name: request.user.name,
          email: request.user.email,
        };

        console.log(
          `[Upload String] Sending emails to ${collaborators.length} collaborators`
        );

        // Send email notifications to collaborators with enhanced data
        const emailPromises = collaborators.map(async (collaborator) => {
          if (collaborator.email !== uploaderInfo.email) {
            // Don't email the uploader
            try {
              console.log(
                `[Upload String] Sending email to: ${collaborator.email}`
              );

              const emailResult =
                await emailService.sendDocumentCreatedNotification({
                  documentName: document.name,
                  uploadedBy: uploaderInfo,
                  recipientEmail: collaborator.email,
                  recipientName: collaborator.name,
                  documentUrl: `${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/dashboard`,
                  fileSize: content.length,
                  mimeType: "text/plain",
                  tags: tags || [],
                  department: "",
                  description: "",
                });

              console.log(
                `[Upload String] Email result for ${collaborator.email}:`,
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
              `[Upload String] Skipping email to uploader: ${collaborator.email}`
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
          `[Upload String] Email notification summary: ${successful} sent, ${failed} failed, ${skipped} skipped`
        );
      } catch (emailError) {
        console.error("Upload string email notification error:", emailError);
        // Don't fail the upload if email fails
      }

      return NextResponse.json({
        success: true,
        data: document,
        message: "Document created successfully",
      });
    } catch (error) {
      console.error("Upload string error:", error);
      return NextResponse.json(
        { success: false, error: "Upload failed" },
        { status: 500 }
      );
    }
  })(request);
}

export { POST };
