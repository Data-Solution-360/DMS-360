import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth.js";
import { TagService } from "../../../lib/firestore.js";

// GET - Get all tags
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category");
      const search = searchParams.get("search");

      let tags;

      if (search) {
        tags = await TagService.searchTags(search);
      } else if (category) {
        tags = await TagService.getTagsByCategory(category);
      } else {
        tags = await TagService.getAllTags();
      }

      return NextResponse.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      console.error("Get tags error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Create new tag
async function POST(request) {
  return requireAuth(async (request) => {
    try {
      const tagData = await request.json();
      const userId = request.user.userId;

      // Add user info to tag
      const newTag = {
        ...tagData,
        createdBy: userId,
        createdByEmail: request.user.email,
        createdByName: request.user.name,
      };

      const tag = await TagService.createTag(newTag);

      return NextResponse.json({
        success: true,
        data: tag,
      });
    } catch (error) {
      console.error("Create tag error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET, POST };
