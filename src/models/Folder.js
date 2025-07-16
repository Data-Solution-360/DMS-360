import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    path: {
      type: String,
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
    },
    googleDriveFolderId: {
      type: String,
      default: null,
    },
    permissions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        userEmail: {
          type: String,
          required: true,
        },
        grantedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
folderSchema.index({ parentId: 1 });
folderSchema.index({ level: 1 });
folderSchema.index({ "permissions.userId": 1 });

export const Folder =
  mongoose.models.Folder || mongoose.model("Folder", folderSchema);
