import { NextResponse } from "next/server";
import { UserService } from "../../../lib/firestore";

export async function POST(request) {
  try {
    console.log("[Test Firestore] Starting test...");

    // Generate a guaranteed unique 6-digit UID
    const uniqueUid = await UserService.generateUniqueUid();

    // Test data
    const testUserData = {
      uid: uniqueUid,
      email: "test@example.com",
      name: "Test User",
      role: "user",
      isActive: true,
      profilePicture: null,
    };

    console.log("[Test Firestore] Test data:", testUserData);

    // Try to create a user
    const result = await UserService.createUser(testUserData);

    console.log("[Test Firestore] Success! Created user:", result);

    return NextResponse.json({
      success: true,
      message: "Firestore test successful",
      data: result,
    });
  } catch (error) {
    console.error("[Test Firestore] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to test Firestore user creation",
    endpoint: "/api/test-firestore",
  });
}
