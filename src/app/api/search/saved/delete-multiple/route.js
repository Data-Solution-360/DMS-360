import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth.js";
import { SearchService } from "../../../../../lib/services/index.js";

// DELETE - Delete multiple saved searches
async function DELETE(request) {
  return requireAuth(async (request) => {
    try {
      const { searchIds } = await request.json();

      if (!searchIds || !Array.isArray(searchIds) || searchIds.length === 0) {
        return NextResponse.json(
          { success: false, error: "Search IDs are required" },
          { status: 400 }
        );
      }

      await SearchService.deleteMultipleSavedSearches(searchIds);

      return NextResponse.json({
        success: true,
        message: "Saved searches deleted successfully",
      });
    } catch (error) {
      console.error("Delete multiple saved searches error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE };
