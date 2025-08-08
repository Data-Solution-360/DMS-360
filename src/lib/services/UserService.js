import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import { COLLECTIONS } from "./constants.js";

export class UserService {
  static async createUser(userData) {
    try {
      const docRef = await adminDb.collection(COLLECTIONS.USERS).add({
        ...userData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error("[UserService] Error creating user:", error);
      console.error("[UserService] Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  static async getUserById(userId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.USERS).doc(userId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.USERS)
        .where("email", "==", email.toLowerCase())
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }

  static async getUserByUid(uid) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.USERS)
        .where("uid", "==", uid)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user by UID:", error);
      throw error;
    }
  }

  static async generateUniqueUid(maxAttempts = 10) {
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Generate a 6-digit number (100000-999999)
        const uid = Math.floor(Math.random() * 900000) + 100000;
        const uidString = uid.toString();

        // Check if this UID already exists
        const existingUser = await this.getUserByUid(uidString);

        if (!existingUser) {
          return uidString;
        }
      }

      // If we couldn't find a unique UID after maxAttempts, use timestamp-based fallback
      const timestamp = Date.now().toString();
      const fallbackUid = timestamp.slice(-6).padStart(6, "0");
      return fallbackUid;
    } catch (error) {
      console.error("Error generating unique UID:", error);
      throw error;
    }
  }

  static async updateUser(userId, updateData) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.USERS).doc(userId);
      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: userId, ...updateData };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.USERS)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  static async searchUsers(searchTerm) {
    try {
      // Firestore doesn't support full-text search natively
      // This is a simple prefix search on name and email
      const users = await this.getAllUsers();
      const searchLower = searchTerm.toLowerCase();

      return users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  static async getUserByFirebaseUid(firebaseUid) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.USERS)
        .where("firebaseUid", "==", firebaseUid)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user by Firebase UID:", error);
      throw error;
    }
  }
}
