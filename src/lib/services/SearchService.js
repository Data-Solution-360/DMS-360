import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import { COLLECTIONS } from "./constants.js";

export class SearchService {
  // Save a search query for later use
  static async saveSearchQuery(searchData) {
    try {
      const savedSearchData = {
        userId: searchData.userId,
        name: searchData.name,
        description: searchData.description || "",
        query: searchData.query,
        filters: searchData.filters,
        resultsCount: searchData.resultsCount,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await adminDb
        .collection("savedSearches")
        .add(savedSearchData);

      return {
        id: docRef.id,
        ...savedSearchData,
      };
    } catch (error) {
      console.error("Error saving search query:", error);
      throw error;
    }
  }

  // Get saved searches for a user
  static async getSavedSearches(userId) {
    try {
      // Fix: Get all documents first, then filter and sort in memory to avoid index requirement
      const snapshot = await adminDb
        .collection("savedSearches")
        .get();

      let documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by userId
      documents = documents.filter(doc => doc.userId === userId);

      // Sort by createdAt in descending order
      documents.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });

      return documents;
    } catch (error) {
      console.error("Error getting saved searches:", error);
      throw error;
    }
  }

  // Delete a saved search
  static async deleteSavedSearch(searchId) {
    try {
      await adminDb.collection("savedSearches").doc(searchId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting saved search:", error);
      throw error;
    }
  }

  // Delete multiple saved searches
  static async deleteMultipleSavedSearches(searchIds) {
    try {
      const batch = adminDb.batch();
      searchIds.forEach((id) => {
        const docRef = adminDb.collection("savedSearches").doc(id);
        batch.delete(docRef);
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error deleting multiple saved searches:", error);
      throw error;
    }
  }
}
