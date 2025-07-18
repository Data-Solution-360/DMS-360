import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { TagService } from "../../../../lib/firestore.js";

// GET - Get all unique departments from tags
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const departments = await TagService.getAllDepartments();

      return NextResponse.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      console.error("Get departments error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
