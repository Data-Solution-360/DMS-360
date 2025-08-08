import { NextResponse } from "next/server";
import { TagService } from "../../../../lib/services/index.js";
import { requireAuth } from "../../../../lib/auth.js";

// GET - Search tags
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");

      if (!query || query.trim().length < 2) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      const tags = await TagService.searchTags(query.trim());

      return NextResponse.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      console.error("Search tags error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
