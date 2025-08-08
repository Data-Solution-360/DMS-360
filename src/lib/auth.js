import { adminAuth } from "./firebase-admin.js";
import { UserService } from "./services/index.js";

const DEBUG_AUTH = process.env.NODE_ENV === "development";

// Verify Firebase Auth ID token using Firebase Admin SDK
export async function verifyFirebaseToken(idToken) {
  if (!idToken) {
    return null;
  }

  try {
    // Verify the ID token using Firebase Admin Auth
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Try to get user data from Firestore by Firebase UID first
    let user = await UserService.getUserByFirebaseUid(decodedToken.uid);

    // If not found by Firebase UID, try to find by email
    if (!user) {
      user = await UserService.getUserByEmail(decodedToken.email);

      // If found by email, update the record with Firebase UID for future efficiency
      if (user) {
        await UserService.updateUser(user.id, {
          firebaseUid: decodedToken.uid,
        });
        user.firebaseUid = decodedToken.uid;
      }
    }

    if (!user) {
      console.error(
        `[Auth] No user found in Firestore for email: ${decodedToken.email}`
      );
      return null;
    }

    // Return the complete user data from Firestore
    return {
      user: user,
      firebaseUser: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
      },
    };
  } catch (error) {
    console.error("Firebase token verification error:", error);

    // Return specific error types for better client handling
    if (error.code === "auth/id-token-expired") {
      throw new Error("TOKEN_EXPIRED");
    } else if (error.code === "auth/id-token-revoked") {
      throw new Error("TOKEN_REVOKED");
    } else {
      throw new Error("TOKEN_INVALID");
    }
  }
}

// Enhanced requireAuth middleware with better error handling
export const requireAuth = (handler) => {
  return async (request) => {
    try {
      console.log("🔐 Auth middleware called");

      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No auth header found");
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.substring(7);
      console.log("🔍 Token extracted, length:", token.length);

      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log("✅ Token verified for user:", decodedToken.email);

      if (DEBUG_AUTH) {
        console.log("🔐 Auth Debug:", {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
        });
      }

      // Get or create user
      let user = await UserService.getUserByFirebaseUid(decodedToken.uid);
      if (!user) {
        console.log("🔍 User not found by UID, searching by email");
        user = await UserService.getUserByEmail(decodedToken.email);
      }

      if (!user) {
        console.log("🔍 User not found, creating new user");
        // Create new user if none exists
        user = await UserService.createUser({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          lastLoginAt: new Date().toISOString(),
          role: "user", // default role
          hasDocumentAccess: false, // default access
        });
        console.log("✅ New user created:", user.id);
      } else {
        console.log("✅ Existing user found:", user.id);
        // Update existing user with login info
        await UserService.updateUser(user.id, {
          firebaseUid: decodedToken.uid,
          emailVerified: decodedToken.email_verified,
          lastLoginAt: new Date().toISOString(),
        });
      }

      // Add user to request context
      request.user = { user };
      console.log("✅ User attached to request, calling handler");
      return handler(request);
    } catch (error) {
      console.error("❌ Auth error:", error);
      return new Response(
        JSON.stringify({
          error: "Authentication failed",
          details: error.message,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
};

// Middleware to require document access permission
export const requireDocumentAccess = (handler) => {
  return async (request) => {
    try {
      const token = request.cookies.get("firebaseToken")?.value;
      const decoded = await verifyFirebaseToken(token);

      if (!decoded || !decoded.user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Authentication required",
            code: "AUTH_REQUIRED",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Check if user has document access or is admin
      if (!decoded.user.hasDocumentAccess && decoded.user.role !== "admin") {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              "Document access permission required. Please contact an administrator.",
            code: "DOCUMENT_ACCESS_DENIED",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Attach user data to request
      request.user = decoded;
      return await handler(request);
    } catch (error) {
      console.error("Document access middleware error:", error);

      let errorMessage = "Authentication failed";
      let errorCode = "AUTH_FAILED";

      if (error.message === "TOKEN_EXPIRED") {
        errorMessage = "Authentication token has expired";
        errorCode = "TOKEN_EXPIRED";
      } else if (error.message === "TOKEN_REVOKED") {
        errorMessage = "Authentication token has been revoked";
        errorCode = "TOKEN_REVOKED";
      } else if (error.message === "TOKEN_INVALID") {
        errorMessage = "Invalid authentication token";
        errorCode = "TOKEN_INVALID";
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          code: errorCode,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
};

// Middleware to require specific roles
export const requireRole = (allowedRoles) => {
  return (handler) => {
    return async (request) => {
      let idToken = null;

      if (request.headers.get("authorization")?.startsWith("Bearer ")) {
        idToken = request.headers.get("authorization").split("Bearer ")[1];
      } else {
        idToken = request.cookies.get("firebaseToken")?.value;
      }

      const decoded = await verifyFirebaseToken(idToken);

      if (!decoded || !decoded.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check role from users collection data
      if (!decoded.user.role || !allowedRoles.includes(decoded.user.role)) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      request.user = decoded;
      return handler(request);
    };
  };
};
