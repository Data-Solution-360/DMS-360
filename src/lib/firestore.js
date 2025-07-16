import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin.js";

// Collection names
const COLLECTIONS = {
  USERS: "users",
  DOCUMENTS: "documents",
  FOLDERS: "folders",
  TAGS: "tags",
};

// User Service
export class UserService {
  static async createUser(userData) {
    try {
      console.log("[UserService] Creating user with data:", userData);
      console.log("[UserService] Collection name:", COLLECTIONS.USERS);
      console.log(
        "[UserService] Database instance:",
        adminDb ? "Available" : "Not available"
      );

      const docRef = await adminDb.collection(COLLECTIONS.USERS).add({
        ...userData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(
        "[UserService] User created successfully with ID:",
        docRef.id
      );
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
          console.log(
            `[UserService] Generated unique UID: ${uidString} (attempt ${attempt})`
          );
          return uidString;
        }

        console.log(
          `[UserService] UID ${uidString} already exists, trying again... (attempt ${attempt})`
        );
      }

      // If we couldn't find a unique UID after maxAttempts, use timestamp-based fallback
      const timestamp = Date.now().toString();
      const fallbackUid = timestamp.slice(-6).padStart(6, "0");
      console.log(
        `[UserService] Using timestamp-based fallback UID: ${fallbackUid}`
      );
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

  static async deleteUser(userId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.USERS).doc(userId);
      await docRef.delete();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
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

// Document Service
export class DocumentService {
  static async createDocument(documentData) {
    try {
      const docRef = await adminDb.collection(COLLECTIONS.DOCUMENTS).add({
        ...documentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: docRef.id, ...documentData };
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  }

  static async getDocumentById(documentId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc(documentId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }

  static async updateDocument(documentId, updateData) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc(documentId);
      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: documentId, ...updateData };
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  static async deleteDocument(documentId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc(documentId);
      await docRef.delete();
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  static async getDocumentsByFolder(folderId, userId = null) {
    try {
      // Get all documents in the folder first
      const snapshot = await adminDb
        .collection(COLLECTIONS.DOCUMENTS)
        .where("folderId", "==", folderId)
        .get();

      let documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by user if provided
      if (userId) {
        documents = documents.filter((doc) => doc.createdBy === userId);
      }

      // Sort by createdAt in memory to avoid index requirement
      documents.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // desc order
      });

      return documents;
    } catch (error) {
      console.error("Error getting documents by folder:", error);
      throw error;
    }
  }

  static async getAllDocuments(userId = null) {
    try {
      // Fix: Avoid composite index requirement by getting all documents first
      // then filtering and sorting in memory
      const snapshot = await adminDb.collection(COLLECTIONS.DOCUMENTS).get(); // Get all documents without any filtering/ordering

      let documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by user if provided
      if (userId) {
        documents = documents.filter((doc) => doc.createdBy === userId);
      }

      // Sort by createdAt in memory to avoid index requirement
      documents.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // desc order
      });

      return documents;
    } catch (error) {
      console.error("Error getting all documents:", error);
      throw error;
    }
  }

  static async searchDocuments(searchTerm, userId = null) {
    try {
      // Get all documents first, then filter in memory
      const documents = await this.getAllDocuments(userId);
      const searchLower = searchTerm.toLowerCase();

      return documents.filter(
        (doc) =>
          doc.name?.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error("Error searching documents:", error);
      throw error;
    }
  }
}

// Folder Service
export class FolderService {
  static async createFolder(folderData) {
    try {
      const docRef = await adminDb.collection(COLLECTIONS.FOLDERS).add({
        ...folderData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Return the folder with the proper ID
      return {
        id: docRef.id,
        ...folderData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  static async getFolderById(folderId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.FOLDERS).doc(folderId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting folder:", error);
      throw error;
    }
  }

  static async updateFolder(folderId, updateData) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.FOLDERS).doc(folderId);
      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: folderId, ...updateData };
    } catch (error) {
      console.error("Error updating folder:", error);
      throw error;
    }
  }

  static async deleteFolder(folderId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.FOLDERS).doc(folderId);
      await docRef.delete();
      return true;
    } catch (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }
  }

  static async getFoldersByParent(parentId = null) {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.FOLDERS).get();

      let folders = snapshot.docs.map((doc) => ({
        id: doc.id, // FIX: Properly set the document ID
        ...doc.data(),
      }));

      // Filter by parentId in memory
      folders = folders.filter((folder) => folder.parentId === parentId);

      // Sort by name in memory to avoid index requirement
      folders.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      return folders;
    } catch (error) {
      console.error("Error getting folders by parent:", error);
      throw error;
    }
  }

  static async getAllFolders() {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.FOLDERS).get();

      const allFolders = snapshot.docs.map((doc) => ({
        id: doc.id, // FIX: Properly set the document ID
        ...doc.data(),
      }));

      // Sort by createdAt in memory (most recent first)
      allFolders.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // desc order
      });

      return allFolders;
    } catch (error) {
      console.error("Error getting all folders:", error);
      throw error;
    }
  }

  static async getFolderTree(parentId = null) {
    try {
      const folders = await this.getAllFolders();

      const buildTree = (parentId) => {
        return folders
          .filter((folder) => folder.parentId === parentId)
          .map((folder) => ({
            ...folder,
            children: buildTree(folder.id),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      };

      return buildTree(parentId);
    } catch (error) {
      console.error("Error getting folder tree:", error);
      throw error;
    }
  }

  static async updateFolderPermissions(folderId, permissions) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.FOLDERS).doc(folderId);
      await docRef.update({
        permissions: permissions,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: folderId, permissions };
    } catch (error) {
      console.error("Error updating folder permissions:", error);
      throw error;
    }
  }
}

// Tag Service
export class TagService {
  static async createTag(tagData) {
    try {
      const docRef = await adminDb.collection(COLLECTIONS.TAGS).add({
        ...tagData,
        name: tagData.name.toLowerCase(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: docRef.id, ...tagData };
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  }

  static async getTagById(tagId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.TAGS).doc(tagId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting tag:", error);
      throw error;
    }
  }

  static async updateTag(tagId, updateData) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.TAGS).doc(tagId);
      await docRef.update({
        ...updateData,
        name: updateData.name?.toLowerCase(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: tagId, ...updateData };
    } catch (error) {
      console.error("Error updating tag:", error);
      throw error;
    }
  }

  static async deleteTag(tagId) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.TAGS).doc(tagId);
      await docRef.delete();
      return true;
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  }

  static async getAllTags() {
    try {
      // Get all tags first, then filter and sort in memory to avoid index requirement
      const snapshot = await adminDb.collection(COLLECTIONS.TAGS).get();

      const allTags = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter active tags and sort by name
      return allTags
        .filter((tag) => tag.isActive === true)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (error) {
      console.error("Error getting all tags:", error);
      throw error;
    }
  }

  static async searchTags(searchTerm) {
    try {
      const tags = await this.getAllTags();
      const searchLower = searchTerm.toLowerCase();

      return tags.filter(
        (tag) =>
          tag.name?.toLowerCase().includes(searchLower) ||
          tag.description?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error("Error searching tags:", error);
      throw error;
    }
  }

  static async getTagsByCategory(category) {
    try {
      // Get all tags first, then filter and sort in memory to avoid index requirement
      const snapshot = await adminDb.collection(COLLECTIONS.TAGS).get();

      const allTags = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by category and active status, then sort by name
      return allTags
        .filter((tag) => tag.category === category && tag.isActive === true)
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (error) {
      console.error("Error getting tags by category:", error);
      throw error;
    }
  }
}

// Export all services
export const firestoreServices = {
  users: UserService,
  documents: DocumentService,
  folders: FolderService,
  tags: TagService,
};
