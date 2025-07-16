import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const envInfo = {
      MONGODB_URI: process.env.MONGODB_URI ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV || "Not set",
      hasMongoUri: !!process.env.MONGODB_URI,
    };

    return NextResponse.json({
      success: true,
      environment: envInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug endpoint failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
