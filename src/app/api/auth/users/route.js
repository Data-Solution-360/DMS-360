import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth.js";
import { UserService } from "../../../../lib/firestore.js";

// GET - List all users (admin only)
async function GET(request) {
  return requireRole(["admin"])(async (request) => {
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
  return requireRole(["admin"])(async (request) => {
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
      console.error("Create user error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
