import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import { COLLECTIONS } from "./constants.js";
import { FolderService } from "./FolderService.js";
import { TagService } from "./TagService.js";
import { UserService } from "./UserService.js";

export class DocumentService {
  // Helper function to filter documents to show only the latest version of each document
  static filterLatestVersions(documents) {
    console.log("🔍 Debug - filterLatestVersions input:", documents.length);

    // Create a map to track document families
    const documentFamilies = new Map();

    // First, identify all documents that are parents (have versions pointing to them)
    const parentIds = new Set();
    documents.forEach((doc) => {
      if (doc.parentDocumentId) {
        parentIds.add(doc.parentDocumentId);
      }
    });

    console.log(" Debug - Parent IDs found:", parentIds.size);

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

    console.log("🔍 Debug - Document families:", documentFamilies.size);

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

    console.log(
      "🔍 Debug - filterLatestVersions output:",
      latestVersions.length
    );
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

      console.log("🔍 Debug - Raw documents from DB:", documents.length);

      // Filter by user if provided
      if (userId) {
        const beforeUserFilter = documents.length;
        documents = documents.filter((doc) => doc.createdBy === userId);
        console.log("🔍 Debug - After user filter:", {
          before: beforeUserFilter,
          after: documents.length,
          filtered: beforeUserFilter - documents.length,
        });
      }

      // Filter to show only the latest version of each document
      const beforeVersionFilter = documents.length;
      documents = this.filterLatestVersions(documents);
      console.log("🔍 Debug - After version filter:", {
        before: beforeVersionFilter,
        after: documents.length,
        filtered: beforeVersionFilter - documents.length,
      });

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

  // New method to get ALL documents without filtering to latest versions
  static async getAllDocumentsWithVersions(userId = null) {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.DOCUMENTS).get();

      let documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(
        "🔍 Debug - Raw documents from DB (with versions):",
        documents.length
      );

      // Filter by user if provided
      if (userId) {
        const beforeUserFilter = documents.length;
        documents = documents.filter((doc) => doc.createdBy === userId);
        console.log("🔍 Debug - After user filter (with versions):", {
          before: beforeUserFilter,
          after: documents.length,
          filtered: beforeUserFilter - documents.length,
        });
      }

      // Sort by createdAt in memory to avoid index requirement
      documents.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime; // desc order
      });

      return documents;
    } catch (error) {
      console.error("Error getting all documents with versions:", error);
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
          const { CloudStorageService } = await import("../storage.js");

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
