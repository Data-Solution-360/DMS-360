import { requireAuth } from "@/lib/auth.js";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

async function POST(request, { params }) {
  return requireAuth(async () => {
    try {
      const { id } = await params;

      if (!id || typeof id !== "string" || id.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid trash item identifier provided",
            code: "INVALID_ID",
          },
          { status: 400 }
        );
      }

      const trashRef = adminDb.collection("trashbox").doc(id);
      const trashDoc = await trashRef.get();

      if (!trashDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The specified trash item could not be found. It may have been permanently deleted or already restored.",
            code: "TRASH_ITEM_NOT_FOUND",
          },
          { status: 404 }
        );
      }

      const trashData = trashDoc.data();

      if (trashData.type !== "document" || !trashData.docId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The selected item is not a valid document or is missing required document information.",
            code: "INVALID_TRASH_ITEM_TYPE",
          },
          { status: 400 }
        );
      }

      const documentRef = adminDb.collection("documents").doc(trashData.docId);
      const documentSnap = await documentRef.get();

      if (!documentSnap.exists) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The original document cannot be found. It may have been permanently deleted from the system.",
            code: "ORIGINAL_DOCUMENT_NOT_FOUND",
          },
          { status: 404 }
        );
      }

      // Reactivate the document
      await documentRef.update({
        inTrash: false,
        updatedAt: FieldValue.serverTimestamp(),
        // Optionally remove deletion metadata
        deletedAt: FieldValue.delete(),
        deletedBy: FieldValue.delete(),
      });

      // Remove from trashbox
      await trashRef.delete();

      return NextResponse.json({
        success: true,
        message:
          "Document has been successfully restored and is now available in your documents folder.",
        data: {
          documentId: trashData.docId,
          restoredAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error restoring document:", error);

      // Custom error handling based on error type
      let errorMessage =
        "An unexpected error occurred while attempting to restore the document.";
      let errorCode = "RESTORE_FAILED";
      let statusCode = 500;

      // Check for specific error patterns and provide custom messages
      if (error.message && error.message.includes("permission")) {
        errorMessage =
          "You don't have sufficient permissions to restore this document. Please contact your administrator.";
        errorCode = "INSUFFICIENT_PERMISSIONS";
        statusCode = 403;
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "Network connection issue detected. Please check your internet connection and try again.";
        errorCode = "NETWORK_ERROR";
        statusCode = 503;
      } else if (error.message && error.message.includes("timeout")) {
        errorMessage =
          "The operation timed out. Please try again or contact support if the issue persists.";
        errorCode = "OPERATION_TIMEOUT";
        statusCode = 408;
      } else if (error.message && error.message.includes("quota")) {
        errorMessage =
          "System resources are currently limited. Please try again later or contact support.";
        errorCode = "RESOURCE_LIMIT";
        statusCode = 429;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: errorCode,
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      );
    }
  })(request);
}

export { POST };
