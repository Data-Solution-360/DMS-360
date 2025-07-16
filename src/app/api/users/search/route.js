import { NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth.js";
import { connectDB } from "../../../../lib/database.js";

// Inline User model
const mongoose = require("mongoose");
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

// GET - Search users (admin only)
async function GET(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");

      if (!query || query.trim().length < 2) {
        return NextResponse.json({
          success: true,
          users: [],
        });
      }

      const searchRegex = new RegExp(query, "i");
      const users = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      })
        .select("_id name email role")
        .limit(10)
        .sort({ name: 1 });

      return NextResponse.json({
        success: true,
        users: users,
      });
    } catch (error) {
      console.error("Search users error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
