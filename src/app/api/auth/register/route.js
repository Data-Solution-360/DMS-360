import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/auth.js";
import { UserService } from "../../../../lib/firestore.js";

// POST - User registration
async function POST(request) {
  try {
    const { email, password, name, role = "employee" } = await request.json();

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

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique 6-digit UID
    const customUid = await UserService.generateUniqueUid();

    // Create user
    const userData = {
      uid: customUid, // Our custom 6-digit UID
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      hasDocumentAccess: false,
    };

    const user = await UserService.createUser(userData);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasDocumentAccess: user.hasDocumentAccess,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export { POST };
