import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin.js";

// Collection names
const COLLECTIONS = {
  USERS: "users",
  DOCUMENTS: "documents",
  FOLDERS: "folders",
  TAGS: "tags",
  DEPARTMENTS: "departments", // Add this line
};

// User Service
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
  // Helper function to filter documents to show only the latest version of each document
  static filterLatestVersions(documents) {
    // Create a map to track document families
    const documentFamilies = new Map();

    // First, identify all documents that are parents (have versions pointing to them)
    const parentIds = new Set();
    documents.forEach((doc) => {
      if (doc.parentDocumentId) {
        parentIds.add(doc.parentDocumentId);
      }
    });

    // Group documents by their family
    documents.forEach((doc) => {
      let familyId;

      if (doc.parentDocumentId) {
        // This is a version of another document
        familyId = doc.parentDocumentId;
      } else if (parentIds.has(doc.id)) {
        // This is a parent document that has versions
        familyId = doc.id;
      } else {
        // This is a standalone document
        familyId = doc.id;
      }

      if (!documentFamilies.has(familyId)) {
        documentFamilies.set(familyId, []);
      }
      documentFamilies.get(familyId).push(doc);
    });

    // For each family, find the latest version
    const latestVersions = [];
    documentFamilies.forEach((family, familyId) => {
      family.forEach((doc) => {});

      if (family.length === 1) {
        // Single document (no versions)
        latestVersions.push(family[0]);
      } else {
        // Multiple versions - find the highest version number
        const latest = family.reduce((latest, current) => {
          // Handle cases where version might not be set
          const latestVersion =
            parseInt(latest.version) || (latest.isLatestVersion ? 999 : 1);
          const currentVersion =
            parseInt(current.version) || (current.isLatestVersion ? 999 : 1);

          // If one has isLatestVersion true and the other doesn't, prefer the one with true
          if (current.isLatestVersion && !latest.isLatestVersion) {
            return current;
          }
          if (!current.isLatestVersion && latest.isLatestVersion) {
            return latest;
          }

          // Otherwise, use version number
          return currentVersion > latestVersion ? current : latest;
        });
        latestVersions.push(latest);
      }
    });
    return latestVersions;
  }

  static async createDocument(documentData) {
    try {
      const docRef = await adminDb.collection(COLLECTIONS.DOCUMENTS).add({
        ...documentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Return with proper timestamps
      return {
        id: docRef.id,
        ...documentData,
        createdAt: new Date().toISOString(), // Use current time for immediate display
        updatedAt: new Date().toISOString(),
      };
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

      // Filter to show only the latest version of each document
      documents = this.filterLatestVersions(documents);

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

      // Filter to show only the latest version of each document
      documents = this.filterLatestVersions(documents);

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

  // Version Management Methods
  static async getDocumentVersions(documentId) {
    try {
      // Get all documents with the same parentDocumentId
      const snapshot = await adminDb
        .collection(COLLECTIONS.DOCUMENTS)
        .where("parentDocumentId", "==", documentId)
        .get();

      let versions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Also include the original document if it exists
      const originalDoc = await this.getDocumentById(documentId);
      if (originalDoc) {
        // Check if the original document is already in versions
        const isAlreadyIncluded = versions.some((v) => v.id === documentId);
        if (!isAlreadyIncluded) {
          // Ensure the original document has version 1 and isLatestVersion set properly
          const originalWithVersion = {
            ...originalDoc,
            version: originalDoc.version || 1,
            isLatestVersion: originalDoc.isLatestVersion !== false, // Default to true if not set
            parentDocumentId: originalDoc.parentDocumentId || documentId, // Ensure it has parentDocumentId
          };
          versions.push(originalWithVersion);
        }
      }

      // Sort by version number (latest first)
      versions.sort((a, b) => {
        const versionA = parseInt(a.version) || 1;
        const versionB = parseInt(b.version) || 1;
        return versionB - versionA;
      });

      return versions;
    } catch (error) {
      console.error("Error getting document versions:", error);
      throw error;
    }
  }

  static async updateAllDocumentVersions(documentId, updateData) {
    try {
      // Get all versions of the document
      const versions = await this.getDocumentVersions(documentId);

      // Update each version
      const updatePromises = versions.map(async (version) => {
        try {
          await this.updateDocument(version.id, updateData);
        } catch (error) {
          console.error(`Error updating version ${version.id}:`, error);
        }
      });

      await Promise.allSettled(updatePromises);
      return true;
    } catch (error) {
      console.error("Error updating all document versions:", error);
      throw error;
    }
  }

  static async getAllDocumentVersions(originalDocumentId) {
    try {
      // Get all documents where originalDocumentId matches
      const versionsByOriginalId = await adminDb
        .collection("documents")
        .where("originalDocumentId", "==", originalDocumentId)
        .get();

      // Get the original document itself (in case it doesn't have originalDocumentId set)
      const originalDoc = await adminDb
        .collection("documents")
        .doc(originalDocumentId)
        .get();

      const allVersions = [];

      // Add documents from originalDocumentId query
      versionsByOriginalId.forEach((doc) => {
        allVersions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Add the original document if it exists and isn't already included
      if (
        originalDoc.exists &&
        !allVersions.find((v) => v.id === originalDoc.id)
      ) {
        allVersions.push({
          id: originalDoc.id,
          ...originalDoc.data(),
        });
      }

      // Sort by version number (ascending)
      allVersions.sort((a, b) => {
        const versionA = parseInt(a.version) || 1;
        const versionB = parseInt(b.version) || 1;
        return versionA - versionB;
      });

      return allVersions;
    } catch (error) {
      console.error(
        "[DocumentService] Error fetching all document versions:",
        error
      );
      throw error;
    }
  }

  // New method to populate document data with related entities
  static async populateDocumentData(documents) {
    if (!Array.isArray(documents)) {
      documents = [documents];
    }

    const populatedDocuments = await Promise.all(
      documents.map(async (document) => {
        const populated = { ...document };

        // Populate user data if createdBy is an ID
        if (document.createdBy && typeof document.createdBy === "string") {
          try {
            const user = await UserService.getUserById(document.createdBy);
            if (user) {
              populated.uploadedBy = {
                id: user.id,
                name: user.name,
                email: user.email,
              };
            }
          } catch (error) {
            console.error("Error populating user data:", error);
            populated.uploadedBy = {
              id: document.createdBy,
              name: document.createdByName || "Unknown User",
              email: document.createdByEmail || "unknown@example.com",
            };
          }
        }

        // Populate folder data if folderId is an ID
        if (document.folderId && typeof document.folderId === "string") {
          try {
            const folder = await FolderService.getFolderById(document.folderId);
            if (folder) {
              populated.folderId = {
                id: folder.id,
                name: folder.name,
              };
            }
          } catch (error) {
            console.error("Error populating folder data:", error);
            populated.folderId = {
              id: document.folderId,
              name: "Unknown Folder",
            };
          }
        }

        // Populate tags data if tags are IDs
        if (document.tags && Array.isArray(document.tags)) {
          try {
            const tagPromises = document.tags.map(async (tag) => {
              if (typeof tag === "string") {
                // It's a tag ID, fetch the tag
                const tagData = await TagService.getTagById(tag);
                return tagData
                  ? {
                      id: tagData.id,
                      displayName: tagData.displayName,
                      name: tagData.name,
                    }
                  : { id: tag, displayName: "Unknown Tag" };
              } else if (tag && typeof tag === "object" && tag.id) {
                // It's already a tag object, just ensure it has displayName
                return {
                  id: tag.id,
                  displayName: tag.displayName || tag.name || "Unknown Tag",
                  name: tag.name,
                };
              } else {
                // It's a string tag name (legacy)
                return { id: tag, displayName: tag, name: tag };
              }
            });

            populated.tags = await Promise.all(tagPromises);
          } catch (error) {
            console.error("Error populating tags data:", error);
            populated.tags = document.tags.map((tag) =>
              typeof tag === "string"
                ? { id: tag, displayName: tag, name: tag }
                : tag
            );
          }
        }

        return populated;
      })
    );

    return Array.isArray(documents)
      ? populatedDocuments
      : populatedDocuments[0];
  }

  static async advancedSearch({
    query = "",
    tags = [],
    fileType = "",
    userId = null,
    isAdmin = false,
    includePrivate = false,
  }) {
    try {
      // Get all documents (filtered by user if not admin)
      let documents = await this.getAllDocuments(userId);

      // Filter to only show latest versions
      documents = this.filterLatestVersions(documents);

      // Apply privacy filter for non-admin users
      if (!isAdmin) {
        documents = documents.filter(
          (doc) =>
            !doc.isPrivate && !doc.isRestricted && doc.visibility !== "private"
        );
      }

      const queryLower = query.toLowerCase();
      const tagsLower = tags.map((tag) => tag.toLowerCase());

      return documents.filter((doc) => {
        let matches = true;

        // Text search across multiple fields
        if (query) {
          const textMatch =
            doc.originalName?.toLowerCase().includes(queryLower) ||
            doc.name?.toLowerCase().includes(queryLower) ||
            doc.title?.toLowerCase().includes(queryLower) ||
            doc.description?.toLowerCase().includes(queryLower) ||
            doc.content?.toLowerCase().includes(queryLower) ||
            doc.tags?.some((tag) =>
              (typeof tag === "string"
                ? tag.toLowerCase()
                : (tag.displayName || tag.name || "").toLowerCase()
              ).includes(queryLower)
            );

          matches = matches && textMatch;
        }

        // Tag filter
        if (tagsLower.length > 0) {
          const tagMatch = doc.tags?.some((tag) =>
            tagsLower.some((searchTag) =>
              (typeof tag === "string"
                ? tag.toLowerCase()
                : (tag.displayName || tag.name || "").toLowerCase()
              ).includes(searchTag)
            )
          );
          matches = matches && tagMatch;
        }

        // File type filter
        if (fileType) {
          const typeMatch =
            this.getFileType(doc.originalName || doc.name) ===
            fileType.toLowerCase();
          matches = matches && typeMatch;
        }

        return matches;
      });
    } catch (error) {
      console.error("Error in advanced search:", error);
      throw error;
    }
  }

  static filterLatestVersions(documents) {
    // Group documents by originalDocumentId or id (for original documents)
    const documentGroups = {};

    documents.forEach((doc) => {
      const groupId = doc.originalDocumentId || doc.id;
      if (!documentGroups[groupId]) {
        documentGroups[groupId] = [];
      }
      documentGroups[groupId].push(doc);
    });

    // Return only the latest version from each group
    return Object.values(documentGroups).map((group) => {
      // Sort by version number and get the latest
      return group.sort((a, b) => {
        const versionA = parseInt(a.version) || 1;
        const versionB = parseInt(b.version) || 1;
        return versionB - versionA;
      })[0];
    });
  }

  static getFileType(filename) {
    if (!filename) return "";

    const extension = filename.split(".").pop()?.toLowerCase();

    const typeMap = {
      pdf: "pdf",
      doc: "document",
      docx: "document",
      txt: "text",
      xls: "spreadsheet",
      xlsx: "spreadsheet",
      csv: "spreadsheet",
      ppt: "presentation",
      pptx: "presentation",
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      mp4: "video",
      avi: "video",
      mov: "video",
      zip: "archive",
      rar: "archive",
      "7z": "archive",
    };

    return typeMap[extension] || "other";
  }

  static async calculateTotalStorageUsed() {
    try {
      // Get ALL documents (including all versions) without any filtering
      const snapshot = await adminDb.collection(COLLECTIONS.DOCUMENTS).get();

      let totalStorage = 0;
      let documentCount = 0;
      const storageByType = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const size = data.size || 0;
        const mimeType = data.mimeType || "unknown";

        totalStorage += size;
        documentCount++;

        // Track storage by file type
        const fileType = this.getFileType(data.originalName || data.name);
        if (!storageByType[fileType]) {
          storageByType[fileType] = { size: 0, count: 0 };
        }
        storageByType[fileType].size += size;
        storageByType[fileType].count++;
      });

      return {
        totalStorage,
        documentCount,
        storageByType,
        averageFileSize: documentCount > 0 ? totalStorage / documentCount : 0,
      };
    } catch (error) {
      console.error("Error calculating total storage:", error);
      throw error;
    }
  }

  static async getStorageStatsByUser() {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.DOCUMENTS).get();
      const userStorage = {};

      // Collect all userIds
      const userIds = Array.from(
        new Set(
          snapshot.docs.map((doc) => doc.data().createdBy).filter(Boolean)
        )
      );

      // Batch fetch user data (Firestore 'in' queries support up to 10 at a time)
      const userMap = {};
      for (let i = 0; i < userIds.length; i += 10) {
        const batchIds = userIds.slice(i, i + 10);
        const userDocs = await adminDb
          .collection(COLLECTIONS.USERS)
          .where("__name__", "in", batchIds)
          .get();
        userDocs.forEach((doc) => {
          userMap[doc.id] = doc.data();
        });
      }

      // Now build the userStorage object
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const userId = data.createdBy;
        const size = data.size || 0;

        if (userId) {
          if (!userStorage[userId]) {
            const user = userMap[userId] || {};
            userStorage[userId] = {
              totalSize: 0,
              documentCount: 0,
              userName: user.name || data.createdByName || "Unknown User",
              userEmail: user.email || data.createdByEmail || "",
            };
          }
          userStorage[userId].totalSize += size;
          userStorage[userId].documentCount++;
        }
      });

      return userStorage;
    } catch (error) {
      console.error("Error getting storage stats by user:", error);
      throw error;
    }
  }

  static async getStorageStatsDetailed() {
    try {
      const [storageStats, userStats] = await Promise.all([
        this.calculateTotalStorageUsed(),
        this.getStorageStatsByUser(),
      ]);

      // Get orphaned files count (files without corresponding documents)
      // This would require checking your Google Cloud Storage bucket
      const orphanedFilesInfo = await this.detectOrphanedFiles();

      return {
        ...storageStats,
        userStats,
        orphanedFiles: orphanedFilesInfo,
        lastCalculated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting detailed storage stats:", error);
      throw error;
    }
  }

  // Method to detect orphaned files (requires Google Cloud Storage admin setup)
  static async detectOrphanedFiles() {
    try {
      // This would require Google Cloud Storage admin SDK
      // For now, we'll return a placeholder
      return {
        count: 0,
        estimatedSize: 0,
        lastChecked: new Date().toISOString(),
        note: "Orphaned file detection requires Google Cloud Storage API integration",
      };
    } catch (error) {
      console.error("Error detecting orphaned files:", error);
      return {
        count: 0,
        estimatedSize: 0,
        error: error.message,
      };
    }
  }

  static async deleteDocumentWithStorage(documentId) {
    try {
      // Get the document first
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Get all versions
      const allVersions = await this.getAllDocumentVersions(
        document.originalDocumentId || documentId
      );

      const results = {
        deletedDocuments: 0,
        deletedFiles: 0,
        errors: [],
      };

      // Delete each version and its files
      for (const version of allVersions) {
        try {
          // Delete from Firestore
          await this.deleteDocument(version.id);
          results.deletedDocuments++;

          // Delete files from storage
          const { CloudStorageService } = await import("./storage.js");

          if (version.filePath) {
            try {
              await CloudStorageService.deleteFile(version.filePath);
              results.deletedFiles++;
            } catch (error) {
              results.errors.push(
                `Failed to delete file ${version.filePath}: ${error.message}`
              );
            }
          }

          if (version.thumbnailPath) {
            try {
              await CloudStorageService.deleteFile(version.thumbnailPath);
              results.deletedFiles++;
            } catch (error) {
              results.errors.push(
                `Failed to delete thumbnail ${version.thumbnailPath}: ${error.message}`
              );
            }
          }
        } catch (error) {
          results.errors.push(
            `Failed to delete version ${version.id}: ${error.message}`
          );
        }
      }

      return results;
    } catch (error) {
      console.error("Error in deleteDocumentWithStorage:", error);
      throw error;
    }
  }

  static async bulkDeleteDocuments(documentIds) {
    const results = {
      totalDocuments: 0,
      totalFiles: 0,
      errors: [],
    };

    for (const documentId of documentIds) {
      try {
        const deleteResult = await this.deleteDocumentWithStorage(documentId);
        results.totalDocuments += deleteResult.deletedDocuments;
        results.totalFiles += deleteResult.deletedFiles;
        results.errors.push(...deleteResult.errors);
      } catch (error) {
        results.errors.push(
          `Failed to delete document ${documentId}: ${error.message}`
        );
      }
    }

    return results;
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

  static async updateFolderAccessControl(folderId, accessControlData) {
    try {
      const docRef = adminDb.collection(COLLECTIONS.FOLDERS).doc(folderId);
      await docRef.update({
        ...accessControlData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: folderId, ...accessControlData };
    } catch (error) {
      console.error("Error updating folder access control:", error);
      throw error;
    }
  }

  static async updateChildFoldersAccessControl(parentId, accessControlData) {
    try {
      // Get all folders
      const snapshot = await adminDb.collection(COLLECTIONS.FOLDERS).get();
      const allFolders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Find all child folders recursively
      const findChildFolders = (parentId) => {
        const children = allFolders.filter(
          (folder) => folder.parentId === parentId
        );
        const allChildren = [...children];

        children.forEach((child) => {
          const grandChildren = findChildFolders(child.id);
          allChildren.push(...grandChildren);
        });

        return allChildren;
      };

      const childFolders = findChildFolders(parentId);

      // Update all child folders
      const updatePromises = childFolders.map((folder) => {
        const docRef = adminDb.collection(COLLECTIONS.FOLDERS).doc(folder.id);
        return docRef.update({
          ...accessControlData,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);
      return childFolders.length;
    } catch (error) {
      console.error("Error updating child folders access control:", error);
      throw error;
    }
  }

  static async getFoldersByUserAccess(userId) {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.FOLDERS).get();
      const allFolders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter folders that the user has access to
      const accessibleFolders = allFolders.filter((folder) => {
        // If folder is not restricted, user has access
        if (!folder.isRestricted) {
          return true;
        }

        // If folder is restricted, check if user is in allowedUserIds
        if (folder.allowedUserIds && Array.isArray(folder.allowedUserIds)) {
          return folder.allowedUserIds.includes(userId);
        }

        // Check permissions array as fallback
        if (folder.permissions && Array.isArray(folder.permissions)) {
          return folder.permissions.some(
            (permission) => permission.userId === userId
          );
        }

        return false;
      });

      return accessibleFolders;
    } catch (error) {
      console.error("Error getting folders by user access:", error);
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
      await adminDb
        .collection(COLLECTIONS.TAGS)
        .doc(tagId)
        .update({
          ...updateData,
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
      await adminDb.collection(COLLECTIONS.TAGS).doc(tagId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  }

  static async getAllTags() {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.TAGS)
        .orderBy("displayName")
        .get();

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting all tags:", error);
      throw error;
    }
  }

  static async searchTags(query) {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.TAGS).get();
      const tags = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return tags.filter(
        (tag) =>
          tag.displayName.toLowerCase().includes(query.toLowerCase()) ||
          tag.description.toLowerCase().includes(query.toLowerCase()) ||
          tag.department.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching tags:", error);
      throw error;
    }
  }

  static async getTagsByCategory(category) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.TAGS)
        .where("category", "==", category)
        .orderBy("displayName")
        .get();

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting tags by category:", error);
      throw error;
    }
  }

  static async getTagByName(name) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.TAGS)
        .where("name", "==", name.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Error getting tag by name:", error);
      throw error;
    }
  }

  static async getTagsByDepartment(department) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.TAGS)
        .where("department", "==", department)
        .orderBy("displayName")
        .get();

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting tags by department:", error);
      throw error;
    }
  }

  static async getAllDepartments() {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.TAGS).get();
      const departments = new Set();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.department) {
          departments.add(data.department);
        }
      });

      return Array.from(departments).sort();
    } catch (error) {
      console.error("Error getting departments:", error);
      throw error;
    }
  }

  static async getTagsByDepartmentId(departmentId) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.TAGS)
        .where("departmentId", "==", departmentId)
        .orderBy("displayName")
        .get();

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting tags by department ID:", error);
      throw error;
    }
  }
}

// Department Service
export class DepartmentService {
  static async createDepartment(departmentData) {
    try {
      const docRef = await adminDb.collection(COLLECTIONS.DEPARTMENTS).add({
        ...departmentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { id: docRef.id, ...departmentData };
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  }

  static async updateDepartment(departmentId, updateData) {
    try {
      await adminDb
        .collection(COLLECTIONS.DEPARTMENTS)
        .doc(departmentId)
        .update({
          ...updateData,
          updatedAt: FieldValue.serverTimestamp(),
        });
      return { id: departmentId, ...updateData };
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  }

  static async deleteDepartment(departmentId) {
    try {
      await adminDb
        .collection(COLLECTIONS.DEPARTMENTS)
        .doc(departmentId)
        .delete();
      return true;
    } catch (error) {
      console.error("Error deleting department:", error);
      throw error;
    }
  }

  static async getDepartmentByName(name) {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.DEPARTMENTS)
        .where("name", "==", name.trim())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Error getting department by name:", error);
      throw error;
    }
  }

  static async getAllDepartments() {
    try {
      // Get all departments first, then filter and sort in memory to avoid index requirement
      const snapshot = await adminDb.collection(COLLECTIONS.DEPARTMENTS).get();

      let departments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter by isActive in memory
      departments = departments.filter((dept) => dept.isActive === true);

      // Sort by name in memory
      departments.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      return departments;
    } catch (error) {
      console.error("Error getting all departments:", error);
      throw error;
    }
  }

  static async getDepartmentById(departmentId) {
    try {
      const doc = await adminDb
        .collection(COLLECTIONS.DEPARTMENTS)
        .doc(departmentId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Error getting department by ID:", error);
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
