import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      default: "#3B82F6", // Default blue color
    },
    category: {
      type: String,
      enum: ["general", "department", "priority", "status", "custom"],
      default: "general",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
tagSchema.index({ name: 1 });
tagSchema.index({ category: 1 });
tagSchema.index({ isActive: 1 });
tagSchema.index({ name: "text", description: "text" });

export const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);
