import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin.js";
import { COLLECTIONS } from "./constants.js";

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
