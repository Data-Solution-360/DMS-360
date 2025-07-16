import jwt from "jsonwebtoken";

export async function verifyToken(token) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function requireAuth(handler) {
  return async (request) => {
    const token = request.cookies.get("token")?.value;
    const user = await verifyToken(token);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    request.user = user;
    return handler(request);
  };
}

export function requireRole(allowedRoles) {
  return (handler) => {
    return async (request) => {
      const token = request.cookies.get("token")?.value;
      const user = await verifyToken(token);

      if (!user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      request.user = user;
      return handler(request);
    };
  };
}
