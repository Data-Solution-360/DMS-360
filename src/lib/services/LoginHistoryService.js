import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import { UserService } from "./index.js";

export class LoginHistoryService {
  // Create new login history record
  static async createLoginHistory(loginData) {
    try {
      const loginHistoryData = {
        userId: loginData.userId,
        loginAt: Timestamp.now(),
        ipAddress: loginData.ipAddress || null,
        userAgent: loginData.userAgent || null,
        browserInfo: loginData.browserInfo || null,
        sessionId: loginData.sessionId || null,
        success: loginData.success || true,
        sessionStatus: "active", // active, ended, expired
        lastHeartbeat: Timestamp.now(),
        createdAt: Timestamp.now(),
      };

      console.log("Creating login history:", loginHistoryData);

      const docRef = await adminDb
        .collection("loginHistory")
        .add(loginHistoryData);

      console.log("Login history created with ID:", docRef.id);

      return {
        id: docRef.id,
        ...loginHistoryData,
      };
    } catch (error) {
      console.error("Error creating login history:", error);
      throw error;
    }
  }

  // Update session heartbeat
  static async updateSessionHeartbeat(sessionId, timestamp) {
    try {
      const snapshot = await adminDb
        .collection("loginHistory")
        .where("sessionId", "==", sessionId)
        .where("sessionStatus", "==", "active")
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await doc.ref.update({
          lastHeartbeat: Timestamp.fromDate(new Date(timestamp)),
        });
        console.log("Session heartbeat updated for:", sessionId);
      }
    } catch (error) {
      console.error("Error updating session heartbeat:", error);
      throw error;
    }
  }

  // Update session end
  static async updateSessionEnd(sessionId, endTime, duration) {
    try {
      const snapshot = await adminDb
        .collection("loginHistory")
        .where("sessionId", "==", sessionId)
        .where("sessionStatus", "==", "active")
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await doc.ref.update({
          logoutAt: Timestamp.fromDate(new Date(endTime)),
          sessionDuration: duration,
          sessionStatus: "ended",
          updatedAt: Timestamp.now(),
        });
        console.log("Session end recorded for:", sessionId);
      }
    } catch (error) {
      console.error("Error updating session end:", error);
      throw error;
    }
  }

  // Get login history with user details
  static async getLoginHistoryWithUserDetails(limit = 100, offset = 0) {
    try {
      const snapshot = await adminDb
        .collection("loginHistory")
        .orderBy("loginAt", "desc")
        .limit(limit)
        .offset(offset)
        .get();

      const loginHistory = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user details for each login record
      const loginHistoryWithUsers = await Promise.all(
        loginHistory.map(async (login) => {
          try {
            const user = await UserService.getUserById(login.userId);
            return {
              ...login,
              user: user
                ? {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  }
                : null,
            };
          } catch (error) {
            console.error(`Error fetching user ${login.userId}:`, error);
            return {
              ...login,
              user: null,
            };
          }
        })
      );

      return loginHistoryWithUsers;
    } catch (error) {
      console.error("Error getting login history with user details:", error);
      throw error;
    }
  }

  // Get login history for a specific user with details
  static async getLoginHistoryByUserId(userId, limit = 50) {
    try {
      const snapshot = await adminDb
        .collection("loginHistory")
        .where("userId", "==", userId)
        .orderBy("loginAt", "desc")
        .limit(limit)
        .get();

      const loginHistory = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user details
      const user = await UserService.getUserById(userId);

      const loginHistoryWithUser = loginHistory.map((login) => ({
        ...login,
        user: user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
            }
          : null,
      }));

      return loginHistoryWithUser;
    } catch (error) {
      console.error("Error getting login history by user ID:", error);
      throw error;
    }
  }

  // Get login history with filters and user details
  static async getLoginHistoryWithFilters(filters = {}) {
    try {
      let query = adminDb.collection("loginHistory");

      // Apply filters
      if (filters.userId) {
        query = query.where("userId", "==", filters.userId);
      }
      if (filters.success !== undefined) {
        query = query.where("success", "==", filters.success);
      }
      if (filters.sessionStatus) {
        query = query.where("sessionStatus", "==", filters.sessionStatus);
      }
      if (filters.startDate) {
        query = query.where("loginAt", ">=", filters.startDate);
      }
      if (filters.endDate) {
        query = query.where("loginAt", "<=", filters.endDate);
      }

      const snapshot = await query
        .orderBy("loginAt", "desc")
        .limit(filters.limit || 50)
        .get();

      const loginHistory = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user details for each login record
      const loginHistoryWithUsers = await Promise.all(
        loginHistory.map(async (login) => {
          try {
            const user = await UserService.getUserById(login.userId);
            return {
              ...login,
              user: user
                ? {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  }
                : null,
            };
          } catch (error) {
            console.error(`Error fetching user ${login.userId}:`, error);
            return {
              ...login,
              user: null,
            };
          }
        })
      );

      return loginHistoryWithUsers;
    } catch (error) {
      console.error("Error getting login history with filters:", error);
      throw error;
    }
  }

  // Clean up expired sessions (sessions without heartbeat for more than 1 hour)
  static async cleanupExpiredSessions() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const snapshot = await adminDb
        .collection("loginHistory")
        .where("sessionStatus", "==", "active")
        .where("lastHeartbeat", "<", Timestamp.fromDate(oneHourAgo))
        .get();

      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          sessionStatus: "expired",
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
      console.log(`Cleaned up ${snapshot.docs.length} expired sessions`);
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      throw error;
    }
  }

  // Delete old login history (cleanup)
  static async deleteOldLoginHistory(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const snapshot = await adminDb
        .collection("loginHistory")
        .where("loginAt", "<", Timestamp.fromDate(cutoffDate))
        .get();

      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return snapshot.docs.length;
    } catch (error) {
      console.error("Error deleting old login history:", error);
      throw error;
    }
  }

  // Get login statistics
  static async getLoginStatistics() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [todayLogins, weekLogins, monthLogins, totalLogins] =
        await Promise.all([
          adminDb
            .collection("loginHistory")
            .where("loginAt", ">=", Timestamp.fromDate(oneDayAgo))
            .count()
            .get(),
          adminDb
            .collection("loginHistory")
            .where("loginAt", ">=", Timestamp.fromDate(oneWeekAgo))
            .count()
            .get(),
          adminDb
            .collection("loginHistory")
            .where("loginAt", ">=", Timestamp.fromDate(oneMonthAgo))
            .count()
            .get(),
          adminDb.collection("loginHistory").count().get(),
        ]);

      return {
        today: todayLogins.data().count,
        thisWeek: weekLogins.data().count,
        thisMonth: monthLogins.data().count,
        total: totalLogins.data().count,
      };
    } catch (error) {
      console.error("Error getting login statistics:", error);
      throw error;
    }
  }
}
