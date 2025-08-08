import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import { COLLECTIONS } from "./constants.js";

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



