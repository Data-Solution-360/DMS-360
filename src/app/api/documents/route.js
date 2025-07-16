import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Inline database connection to avoid module resolution issues
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

// Inline User model
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

const User = mongoose.models.User || mongoose.model("User", userSchema);

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

const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

// Inline auth function to avoid module resolution issues
async function verifyToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function GET(request) {
  // Check authentication
  const token = request.cookies.get("token")?.value;
  const decodedUser = await verifyToken(token);

  if (!decodedUser) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    // Check if user has document access
    const user = await User.findById(decodedUser.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.hasDocumentAccess && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Please contact admin for document access.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");
    const searchScope = searchParams.get("searchScope") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query - only show latest versions
    let query = { isLatestVersion: true, isActive: true };

    if (folderId) {
      query.folderId = folderId;
    }

    // Add date filtering
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate + "T00:00:00.000Z");
      }

      if (endDate) {
        query.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
      }
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();

      // Create search conditions based on scope
      let searchConditions = [];

      if (searchScope === "all" || searchScope === "titles") {
        searchConditions.push(
          { name: { $regex: searchTerm, $options: "i" } }, // Document name
          { originalName: { $regex: searchTerm, $options: "i" } } // Original name
        );
      }

      if (searchScope === "all" || searchScope === "tags") {
        searchConditions.push(
          { tags: { $in: [new RegExp(searchTerm, "i")] } } // Tags (exact match)
        );
      }

      // Use $or to search across selected fields
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
      }
    }

    // Build sort object
    const sort = {};
    if (search && search.trim()) {
      // When searching, prioritize exact matches in names first
      // Then sort by creation date
      sort.name = 1; // Sort alphabetically by name for search results
    }
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const documents = await Document.find(query)
      .populate("folderId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Document.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
