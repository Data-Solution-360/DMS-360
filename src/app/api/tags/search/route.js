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

// Inline auth function
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

// GET - Search tags (available to all authenticated users)
export async function GET(request) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit")) || 10;

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Search for tags that start with the query
    const tags = await Tag.find({
      isActive: true,
      name: { $regex: `^${query.trim()}`, $options: "i" },
    })
      .select("name color category description")
      .sort({ name: 1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Search tags error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
