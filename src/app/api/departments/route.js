import { NextResponse } from "next/server";
import { DepartmentService } from "../../../lib/services/index.js";
import { requireAuth } from "../../../lib/auth.js";

// GET - Get all departments (accessible to all authenticated users)
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const departments = await DepartmentService.getAllDepartments();

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

// POST - Create new department (admin only)
async function POST(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      const {
        name,
        description,
        manager,
        isActive = true,
      } = await request.json();

      if (!name) {
        return NextResponse.json(
          { success: false, error: "Department name is required" },
          { status: 400 }
        );
      }

      // Check if department with same name already exists
      const existingDepartment = await DepartmentService.getDepartmentByName(
        name
      );
      if (existingDepartment) {
        return NextResponse.json(
          { success: false, error: "Department with this name already exists" },
          { status: 409 }
        );
      }

      const departmentData = {
        name: name.trim(),
        description: description || "",
        manager: manager || "",
        isActive: isActive,
        createdBy: request.user.user.id,
        createdByName: request.user.user.name,
      };

      const department = await DepartmentService.createDepartment(
        departmentData
      );

      return NextResponse.json({
        success: true,
        data: department,
        message: "Department created successfully",
      });
    } catch (error) {
      console.error("Create department error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update department (admin only)
async function PUT(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      const { id, name, description, manager, isActive } = await request.json();

      if (!id || !name) {
        return NextResponse.json(
          { success: false, error: "ID and name are required" },
          { status: 400 }
        );
      }

      const updateData = {
        name: name.trim(),
        description: description || "",
        manager: manager || "",
        isActive: isActive,
        updatedBy: request.user.user.id,
        updatedByName: request.user.user.name,
      };

      const department = await DepartmentService.updateDepartment(
        id,
        updateData
      );

      return NextResponse.json({
        success: true,
        data: department,
        message: "Department updated successfully",
      });
    } catch (error) {
      console.error("Update department error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - Delete department (admin only)
async function DELETE(request) {
  return requireRole(["admin"])(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const departmentId = searchParams.get("id");

      if (!departmentId) {
        return NextResponse.json(
          { success: false, error: "Department ID is required" },
          { status: 400 }
        );
      }

      // Check if any tags are using this department
      const tagsUsingDepartment = await TagService.getTagsByDepartmentId(
        departmentId
      );
      if (tagsUsingDepartment.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot delete department. ${tagsUsingDepartment.length} tags are using this department.`,
          },
          { status: 400 }
        );
      }

      await DepartmentService.deleteDepartment(departmentId);

      return NextResponse.json({
        success: true,
        message: "Department deleted successfully",
      });
    } catch (error) {
      console.error("Delete department error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, GET, POST, PUT };
