import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { SearchService } from "../../../../lib/services/index.js";

// GET - Get saved searches
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;

      const savedSearches = await SearchService.getSavedSearches(user.id);

      return NextResponse.json({
        success: true,
        data: savedSearches,
      });
    } catch (error) {
      console.error("Get saved searches error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Save a search query
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const user = request.user.user;
      const searchData = await request.json();

      const savedSearch = await SearchService.saveSearchQuery({
        ...searchData,
        userId: user.id,
      });

      return NextResponse.json({
        success: true,
        data: savedSearch,
      });
    } catch (error) {
      console.error("Save search query error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
