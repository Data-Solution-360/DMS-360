import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";

export class DownloadService {
  // Track download activity
  static async trackDownload(downloadData) {
    try {
      const downloadRecord = {
        userId: downloadData.userId,
        documentId: downloadData.documentId,
        documentName: downloadData.documentName,
        documentSize: downloadData.documentSize,
        mimeType: downloadData.mimeType,
        ipAddress: downloadData.ipAddress,
        userAgent: downloadData.userAgent,
        browserInfo: downloadData.browserInfo,
        downloadAt: FieldValue.serverTimestamp(),
        success: downloadData.success || true,
        errorMessage: downloadData.errorMessage || null,
      };

      const docRef = await adminDb
        .collection("downloadHistory")
        .add(downloadRecord);

      return {
        id: docRef.id,
        ...downloadRecord,
      };
    } catch (error) {
      console.error("Error tracking download:", error);
      throw error;
    }
  }

  // Get download history for a user
  static async getDownloadHistory(userId, limit = 50) {
    try {
      const snapshot = await adminDb
        .collection("downloadHistory")
        .where("userId", "==", userId)
        .orderBy("downloadAt", "desc")
        .limit(limit)
        .get();

      const downloads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user data for each download
      const downloadsWithUserData = await Promise.all(
        downloads.map(async (download) => {
          try {
            const userDoc = await adminDb
              .collection("users")
              .doc(download.userId)
              .get();
            if (userDoc.exists) {
              download.user = userDoc.data();
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            download.user = null;
          }
          return download;
        })
      );

      return downloadsWithUserData;
    } catch (error) {
      console.error("Error getting download history:", error);
      throw error;
    }
  }

  // Get all download history (for admin)
  static async getAllDownloadHistory(limit = 100) {
    try {
      const snapshot = await adminDb
        .collection("downloadHistory")
        .orderBy("downloadAt", "desc")
        .limit(limit)
        .get();

      const downloads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user data for each download
      const downloadsWithUserData = await Promise.all(
        downloads.map(async (download) => {
          try {
            const userDoc = await adminDb
              .collection("users")
              .doc(download.userId)
              .get();
            if (userDoc.exists) {
              download.user = userDoc.data();
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            download.user = null;
          }
          return download;
        })
      );

      return downloadsWithUserData;
    } catch (error) {
      console.error("Error getting all download history:", error);
      throw error;
    }
  }

  // Get download statistics
  static async getDownloadStatistics() {
    try {
      const snapshot = await adminDb
        .collection("downloadHistory")
        .orderBy("downloadAt", "desc")
        .limit(1000)
        .get();

      const downloads = snapshot.docs.map((doc) => doc.data());

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);

      const thisMonth = new Date();
      thisMonth.setMonth(thisMonth.getMonth() - 1);

      const stats = {
        total: downloads.length,
        today: downloads.filter((d) => {
          const downloadDate = d.downloadAt?.toDate
            ? d.downloadAt.toDate()
            : new Date(d.downloadAt);
          return downloadDate >= today;
        }).length,
        thisWeek: downloads.filter((d) => {
          const downloadDate = d.downloadAt?.toDate
            ? d.downloadAt.toDate()
            : new Date(d.downloadAt);
          return downloadDate >= thisWeek;
        }).length,
        thisMonth: downloads.filter((d) => {
          const downloadDate = d.downloadAt?.toDate
            ? d.downloadAt.toDate()
            : new Date(d.downloadAt);
          return downloadDate >= thisMonth;
        }).length,
      };

      return stats;
    } catch (error) {
      console.error("Error getting download statistics:", error);
      throw error;
    }
  }
}
