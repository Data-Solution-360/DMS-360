import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { UserService } from "../../../../lib/services/index.js";

// GET - List all users (admin only)
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const users = await UserService.getAllUsers();

      // Remove password from response
      const usersWithoutPassword = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return NextResponse.json({
        success: true,
        data: usersWithoutPassword,
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

// POST - Create new user (admin only)
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const { email, password, name, role, hasDocumentAccess } =
        await request.json();

      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: "Email, password, and name are required" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "User already exists" },
          { status: 409 }
        );
      }

      // Generate unique 6-digit UID
      const customUid = await UserService.generateUniqueUid();

      // Create user
      const userData = {
        uid: customUid, // Our custom 6-digit UID
        email: email.toLowerCase(),
        password, // Password will be hashed in the service
        name,
        role: role || "employee",
        hasDocumentAccess: hasDocumentAccess || false,
      };

      const user = await UserService.createUser(userData);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// PATCH - Update user (admin only)
async function PATCH(request) {
  return requireAuth(async (request) => {
    try {
      const { userId, ...updates } = await request.json();

      if (!userId) {
        return NextResponse.json(
          { success: false, error: "User ID is required" },
          { status: 400 }
        );
      }

      // Validate allowed update fields
      const allowedFields = ["role", "hasDocumentAccess", "name"];
      const updateData = {};

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { success: false, error: "No valid fields to update" },
          { status: 400 }
        );
      }

      // Validate role if it's being updated
      if (
        updateData.role &&
        !["employee", "facilitator", "admin"].includes(updateData.role)
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid role" },
          { status: 400 }
        );
      }

      // Update user
      const updatedUser = await UserService.updateUser(userId, updateData);

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;

      return NextResponse.json({
        success: true,
        data: userWithoutPassword,
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

export { GET, PATCH, POST };
