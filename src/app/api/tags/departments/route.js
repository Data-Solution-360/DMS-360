import { NextResponse } from "next/server";
import { TagService } from "../../../../lib/services/index.js";
import { requireAuth } from "../../../../lib/auth.js";

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
