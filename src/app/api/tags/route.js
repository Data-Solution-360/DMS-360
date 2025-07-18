import { NextResponse } from "next/server";
import { requireAuth, requireRole } from "../../../lib/auth.js";
import { TagService } from "../../../lib/firestore.js";

// GET - Get all tags (accessible to all authenticated users)
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const department = searchParams.get("department");

      let tags;

      if (search) {
        tags = await TagService.searchTags(search);
      } else if (department) {
        tags = await TagService.getTagsByDepartment(department);
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

// POST - Create new tag (admin only)
async function POST(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      const { name, description, color, category, department } =
        await request.json();

      if (!name || !department) {
        return NextResponse.json(
          { success: false, error: "Name and department are required" },
          { status: 400 }
        );
      }

      // Check if tag with same name already exists
      const existingTag = await TagService.getTagByName(name);
      if (existingTag) {
        return NextResponse.json(
          { success: false, error: "Tag with this name already exists" },
          { status: 409 }
        );
      }

      const tagData = {
        name: name.toLowerCase().trim(),
        displayName: name.trim(),
        description: description || "",
        color: color || "#3B82F6",
        category: category || "general",
        department: department.trim(),
        createdBy: request.user.user.id,
        createdByName: request.user.user.name,
      };

      const tag = await TagService.createTag(tagData);

      return NextResponse.json({
        success: true,
        data: tag,
        message: "Tag created successfully",
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

// PUT - Update tag (admin only)
async function PUT(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      const { id, name, description, color, category, department } =
        await request.json();

      if (!id || !name || !department) {
        return NextResponse.json(
          { success: false, error: "ID, name, and department are required" },
          { status: 400 }
        );
      }

      const updateData = {
        name: name.toLowerCase().trim(),
        displayName: name.trim(),
        description: description || "",
        color: color || "#3B82F6",
        category: category || "general",
        department: department.trim(),
        updatedBy: request.user.user.id,
        updatedByName: request.user.user.name,
      };

      const tag = await TagService.updateTag(id, updateData);

      return NextResponse.json({
        success: true,
        data: tag,
        message: "Tag updated successfully",
      });
    } catch (error) {
      console.error("Update tag error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - Delete tag (admin only)
async function DELETE(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const tagId = searchParams.get("id");

      if (!tagId) {
        return NextResponse.json(
          { success: false, error: "Tag ID is required" },
          { status: 400 }
        );
      }

      await TagService.deleteTag(tagId);

      return NextResponse.json({
        success: true,
        message: "Tag deleted successfully",
      });
    } catch (error) {
      console.error("Delete tag error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, GET, POST, PUT };
