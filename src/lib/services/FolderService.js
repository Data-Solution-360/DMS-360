import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import { COLLECTIONS } from "./constants.js";

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
