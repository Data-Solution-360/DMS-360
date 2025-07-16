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

// GET - List all users (admin only)
async function GET(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      await connectDB();

      const users = await User.find({})
        .select("-password")
        .sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Get users error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// PATCH - Update user role and access (admin only)
async function PATCH(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      await connectDB();

      const { userId, role, hasDocumentAccess } = await request.json();

      if (!userId) {
        return NextResponse.json(
          { success: false, error: "User ID is required" },
          { status: 400 }
        );
      }

      const updateData = {};
      if (role) {
        updateData.role = role;
      }
      if (hasDocumentAccess !== undefined) {
        updateData.hasDocumentAccess = hasDocumentAccess;
      }

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user,
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Update user error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, PATCH };
