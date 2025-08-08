import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth.js";
import { LoginHistoryService } from "../../../../lib/services/index.js";

// GET - Get login history
async function GET(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId");
      const limit = parseInt(searchParams.get("limit")) || 50;
      const offset = parseInt(searchParams.get("offset")) || 0;
      const success = searchParams.get("success");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      let history;

      if (userId) {
        // Get login history for specific user
        history = await LoginHistoryService.getLoginHistoryByUserId(
          userId,
          limit
        );
      } else {
        // Get all login history with filters
        const filters = {
          limit,
          offset,
          success:
            success === "true" ? true : success === "false" ? false : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        };

        history = await LoginHistoryService.getLoginHistoryWithFilters(filters);
      }

      return NextResponse.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error("Get login history error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - Clean up old login history (admin only)
async function DELETE(request) {
  return requireAuth(async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const daysOld = parseInt(searchParams.get("daysOld")) || 365;

      const deletedCount = await LoginHistoryService.deleteOldLoginHistory(
        daysOld
      );

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount} old login records`,
        deletedCount,
      });
    } catch (error) {
      console.error("Delete login history error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}

export { DELETE, GET };
