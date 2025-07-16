import { adminAuth } from "./firebase-admin.js";
import { UserService } from "./firestore.js";

// Remove or comment out console.log statements in production
// Replace detailed logging with conditional logging:

const DEBUG_AUTH = process.env.NODE_ENV === "development";

// Verify Firebase Auth ID token using Firebase Admin SDK
export async function verifyFirebaseToken(idToken) {
  if (!idToken) {
    return null;
  }

  try {
    // Verify the ID token using Firebase Admin Auth
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    if (DEBUG_AUTH) {
      console.log(`[Auth] Token verified for user: ${decodedToken.email}`);
    }

    // Try to get user data from Firestore by Firebase UID first
    let user = await UserService.getUserByFirebaseUid(decodedToken.uid);

    // If not found by Firebase UID, try to find by email
    if (!user) {
      console.log(
        `[Auth] User not found by UID, searching by email: ${decodedToken.email}`
      );
      user = await UserService.getUserByEmail(decodedToken.email);

      // If found by email, update the record with Firebase UID for future efficiency
      if (user) {
        console.log(`[Auth] Found user by email, updating with Firebase UID`);
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

    console.log(`[Auth] User data loaded:`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

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
export function requireAuth(handler) {
  return async (request) => {
    try {
      const token = request.cookies.get("firebaseToken")?.value;
      const decoded = await verifyFirebaseToken(token);

      if (!decoded) {
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

      // Attach user data to request
      request.user = decoded;
      return await handler(request);
    } catch (error) {
      console.error("Auth middleware error:", error);

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
}

// Middleware to require specific roles
export function requireRole(allowedRoles) {
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
}
