import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin.js";
import { COLLECTIONS } from "../../../lib/services/constants.js";

export async function GET(request) {
  try {
    console.log("🔍 Folders-simple endpoint called");
    
    // Simple query without authentication
    const snapshot = await adminDb.collection(COLLECTIONS.FOLDERS).get();
    const folders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log("✅ Found folders:", folders.length);
    
    return NextResponse.json({
      success: true,
      data: folders,
      count: folders.length
    });
    
  } catch (error) {
    console.error("❌ Folders-simple error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
