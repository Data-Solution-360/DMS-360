import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    console.log("🔍 Debug folders endpoint called");
    
    // Test Firebase admin import
    const { adminDb } = await import("../../../lib/firebase-admin.js");
    console.log("✅ Firebase admin imported successfully");
    
    // Test constants import
    const { COLLECTIONS } = await import("../../../lib/services/constants.js");
    console.log("✅ Constants imported:", COLLECTIONS);
    
    // Test basic Firestore query
    const snapshot = await adminDb.collection(COLLECTIONS.FOLDERS).limit(1).get();
    console.log("✅ Firestore query successful, docs count:", snapshot.docs.length);
    
    // Test FolderService import
    const { FolderService } = await import("../../../lib/services/index.js");
    console.log("✅ FolderService imported successfully");
    
    return NextResponse.json({
      success: true,
      message: "All imports and basic Firestore connection working",
      foldersCollection: COLLECTIONS.FOLDERS,
      docCount: snapshot.docs.length
    });
    
  } catch (error) {
    console.error("❌ Debug folders error:", error);
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
