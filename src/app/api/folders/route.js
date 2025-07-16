import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Inline database connection
let connection = {};

async function connectDB() {
  if (connection.isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Inline Folder model
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

folderSchema.index({ parentId: 1 });
folderSchema.index({ level: 1 });

const Folder = mongoose.models.Folder || mongoose.model("Folder", folderSchema);

// Inline Document model
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
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ folderId: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({
  name: "text",
  originalName: "text",
  content: "text",
  tags: "text",
});

const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

// Import auth utilities
import { verifyToken } from "../../../lib/auth.js";

export async function GET(request) {
  try {
    await connectDB();

    // Check authentication
    const token = request.cookies.get("token")?.value;
    let user = await verifyToken(token);

    if (!user) {
      // For development mode, create a demo user if no auth
      if (process.env.NODE_ENV === "development") {
        console.log("No auth in development mode, using demo user");
        user = {
          userId: "demo-user-id",
          email: "demo@dms360.com",
          role: "admin",
        };
      } else {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    // If parentId is specified, return only children of that parent
    // Otherwise, return ALL folders to build the complete tree
    let query = parentId ? { parentId } : {};

    // If user is not admin, filter by permissions
    if (user.role !== "admin") {
      // Get folders where user has permission or is the creator
      query = {
        ...query,
        $or: [
          { "permissions.userId": user.userId || user._id },
          { createdBy: user.userId || user._id }, // If folder has creator field
        ],
      };
    }

    console.log("API: User:", user);
    console.log("API: Query:", query);

    const folders = await Folder.find(query).lean();

    console.log(
      "API: Found folders:",
      folders.map((f) => ({
        name: f.name,
        _id: f._id,
        parentId: f.parentId,
        level: f.level,
        permissions: f.permissions?.length || 0,
      }))
    );

    return NextResponse.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error("Get folders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Sanitize folder name
    const sanitizedName = name.trim().replace(/[\/\\]/g, "-");

    if (!sanitizedName) {
      return NextResponse.json(
        {
          success: false,
          error: "Folder name cannot be empty after sanitization",
        },
        { status: 400 }
      );
    }

    // Build path
    let path = sanitizedName;
    let level = 0;

    if (parentId) {
      try {
        const parentFolder = await Folder.findById(parentId);
        if (!parentFolder) {
          return NextResponse.json(
            { success: false, error: "Parent folder not found" },
            { status: 404 }
          );
        }

        // Prevent infinite loops by checking if the sanitized name already exists in the path
        if (parentFolder.path.includes(sanitizedName)) {
          return NextResponse.json(
            {
              success: false,
              error: "Folder name would create a circular reference",
            },
            { status: 400 }
          );
        }

        path = `${parentFolder.path}/${sanitizedName}`;
        level = parentFolder.level + 1;

        // Additional safety check: prevent extremely deep nesting
        if (level > 50) {
          return NextResponse.json(
            { success: false, error: "Folder nesting level too deep" },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error finding parent folder:", error);
        return NextResponse.json(
          { success: false, error: "Invalid parent folder ID" },
          { status: 400 }
        );
      }
    }

    // Check if folder already exists
    try {
      const existingFolder = await Folder.findOne({ path });
      if (existingFolder) {
        return NextResponse.json(
          { success: false, error: "Folder already exists" },
          { status: 409 }
        );
      }

      // Additional safety check: prevent path length issues
      if (path.length > 500) {
        return NextResponse.json(
          { success: false, error: "Folder path too long" },
          { status: 400 }
        );
      }

      // Check for any potential circular references in the entire path
      const pathSegments = path.split("/");
      const uniqueSegments = new Set(pathSegments);
      if (pathSegments.length !== uniqueSegments.size) {
        return NextResponse.json(
          { success: false, error: "Folder path contains duplicate segments" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error checking existing folder:", error);
      return NextResponse.json(
        { success: false, error: "Error checking folder existence" },
        { status: 500 }
      );
    }

    // Create the folder
    try {
      const folder = new Folder({
        name: sanitizedName,
        parentId: parentId || null,
        path,
        level,
      });

      await folder.save();

      return NextResponse.json(
        {
          success: true,
          data: folder,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error saving folder:", error);
      if (error.code === 11000) {
        return NextResponse.json(
          { success: false, error: "Folder already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Failed to create folder" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: "Folder ID is required" },
        { status: 400 }
      );
    }

    // Check if folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return NextResponse.json(
        { success: false, error: "Folder not found" },
        { status: 404 }
      );
    }

    // Check if folder has child folders
    const childFolders = await Folder.find({ parentId: folderId });
    if (childFolders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete folder that contains subfolders. Please delete subfolders first.",
        },
        { status: 400 }
      );
    }

    // Check if folder has documents
    const documents = await Document.find({ folderId: folderId });
    if (documents.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete folder that contains documents. Please delete or move documents first.",
        },
        { status: 400 }
      );
    }

    // Delete the folder
    await Folder.findByIdAndDelete(folderId);

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
