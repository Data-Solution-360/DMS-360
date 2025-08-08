import { NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth.js";
import { adminDb } from "../../../../../lib/firebase-admin.js";

async function GET(request) {
  return requireAuth(async () => {
    try {
      let query = adminDb.collection("trashbox").where("type", "==", "user");
      // optional: order by deletedAt if needed
      // query = query.orderBy("deletedAt", "desc");

      const snapshot = await query.get();
      const items = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

      return NextResponse.json({ success: true, data: items });
    } catch (error) {
      console.error("Error listing trash users:", error);
      return NextResponse.json(
        { success: false, error: "Failed to list trashed users" },
        { status: 500 }
      );
    }
  })(request);
}

export { GET };
