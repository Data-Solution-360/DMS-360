import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "../../../../lib/auth.js";

// GET - Get current user
async function GET(request) {
  try {
    const token = request.cookies.get("firebaseToken")?.value;
    const decoded = await verifyFirebaseToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // User data is already included in the decoded token from verifyFirebaseToken
    const user = decoded.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Remove password from response (if it exists)
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token: token,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export { GET };
