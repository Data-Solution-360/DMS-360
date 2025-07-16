import jwt from "jsonwebtoken";
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

// Inline auth functions
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

// Inline Tag model
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
      default: "#3B82F6",
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

tagSchema.index({ name: 1 });
tagSchema.index({ category: 1 });
tagSchema.index({ isActive: 1 });
tagSchema.index({ name: "text", description: "text" });

const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);

// GET - List all tags (admin only)
async function GET(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const page = parseInt(searchParams.get("page")) || 1;
      const limit = parseInt(searchParams.get("limit")) || 50;

      // Build query
      let query = { isActive: true };

      if (category) {
        query.category = category;
      }

      if (search && search.trim()) {
        query.$or = [
          { name: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      const tags = await Tag.find(query)
        .populate("createdBy", "name email")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      const total = await Tag.countDocuments(query);

      return NextResponse.json({
        success: true,
        data: tags,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get tags error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Create new tag (admin only)
async function POST(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      await connectDB();

      const { name, description, color, category } = await request.json();

      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "Tag name is required" },
          { status: 400 }
        );
      }

      // Check if tag already exists
      const existingTag = await Tag.findOne({
        name: name.trim().toLowerCase(),
      });

      if (existingTag) {
        return NextResponse.json(
          { success: false, error: "Tag already exists" },
          { status: 409 }
        );
      }

      const tag = new Tag({
        name: name.trim().toLowerCase(),
        description: description?.trim() || "",
        color: color || "#3B82F6",
        category: category || "general",
        createdBy: request.user.userId,
      });

      await tag.save();

      return NextResponse.json(
        {
          success: true,
          data: tag,
          message: "Tag created successfully",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Create tag error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
