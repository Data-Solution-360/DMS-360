import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    googleDriveId: {
      type: String,
      required: true,
      unique: true,
    },
    googleDriveUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    uploadedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    // Versioning fields
    version: {
      type: Number,
      default: 1,
    },
    isLatestVersion: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    versionHistory: [
      {
        version: Number,
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document",
        },
        uploadedAt: Date,
        uploadedBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
          email: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
documentSchema.index({ folderId: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({
  name: "text",
  originalName: "text",
  content: "text",
  tags: "text",
});
documentSchema.index({ isActive: 1, isLatestVersion: 1 });
documentSchema.index({ parentDocumentId: 1 });
documentSchema.index({ version: 1 });

export const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
