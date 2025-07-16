import { NextResponse } from "next/server";
import { verifyToken } from "../../../../../lib/auth.js";
import { connectDB } from "../../../../../lib/database.js";

// Inline models
const mongoose = require("mongoose");

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

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "facilitator", "employee"],
      default: "employee",
    },
    hasDocumentAccess: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Folder = mongoose.models.Folder || mongoose.model("Folder", folderSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

function requireRole(allowedRoles) {
  return (handler) => {
    return async (request) => {
      const token = request.cookies.get("token")?.value;
      const user = await verifyToken(token);

      if (!user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      request.user = user;
      return handler(request);
    };
  };
}

// GET - Get folder permissions (admin only)
async function GET(request, { params }) {
  return requireRole(["admin"])(async (request) => {
    try {
      await connectDB();

      const { id } = await params;
      const folder = await Folder.findById(id);

      if (!folder) {
        return NextResponse.json(
          { success: false, error: "Folder not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        permissions: folder.permissions || [],
      });
    } catch (error) {
      console.error("Get folder permissions error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Grant or revoke folder permissions (admin only)
async function POST(request, { params }) {
  return requireRole(["admin"])(async (request) => {
    try {
      await connectDB();

      const { id } = await params;
      const { userId, action } = await request.json();

      if (!userId || !action) {
        return NextResponse.json(
          { success: false, error: "User ID and action are required" },
          { status: 400 }
        );
      }

      if (!["grant", "revoke"].includes(action)) {
        return NextResponse.json(
          { success: false, error: "Action must be 'grant' or 'revoke'" },
          { status: 400 }
        );
      }

      const folder = await Folder.findById(id);
      if (!folder) {
        return NextResponse.json(
          { success: false, error: "Folder not found" },
          { status: 404 }
        );
      }

      if (action === "grant") {
        // Check if user already has permission
        const existingPermission = folder.permissions.find(
          (p) => p.userId.toString() === userId
        );

        if (existingPermission) {
          return NextResponse.json(
            { success: false, error: "User already has access to this folder" },
            { status: 409 }
          );
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
          return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
          );
        }

        // Add permission
        folder.permissions.push({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          grantedAt: new Date(),
        });
      } else if (action === "revoke") {
        // Remove permission
        folder.permissions = folder.permissions.filter(
          (p) => p.userId.toString() !== userId
        );
      }

      await folder.save();

      return NextResponse.json({
        success: true,
        message: `Access ${
          action === "grant" ? "granted" : "revoked"
        } successfully`,
        permissions: folder.permissions,
      });
    } catch (error) {
      console.error("Update folder permissions error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
