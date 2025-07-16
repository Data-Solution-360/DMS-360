import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { TagService } from "../../../../lib/firestore.js";

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
