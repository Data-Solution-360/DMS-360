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

const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);

// GET - Get all active tags (for any authenticated user)
export async function GET(request) {
  try {
    // Check authentication
    const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all active tags, sorted by name
    const tags = await Tag.find({ isActive: true })
      .select("_id name color category")
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Get all tags error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
