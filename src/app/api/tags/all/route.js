import { NextResponse } from "next/server";
import { TagService } from "../../../../lib/services/index.js";
import { requireAuth } from "../../../../lib/auth.js";

// GET - Get all tags
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const tags = await TagService.getAllTags();

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
  })(request);
}

export { GET };
