#!/usr/bin/env node

/**
 * Migration Script: MongoDB to Firestore
 *
 * This script helps migrate data from MongoDB to Firestore.
 * Run this script after setting up Firebase and before switching to the new system.
 */

import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { MongoClient } from "mongodb";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;

async function migrateData() {
  console.log("🚀 Starting migration from MongoDB to Firestore...\n");

  if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in environment variables");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const mongoDb = mongoClient.db();

    console.log("✅ Connected to MongoDB\n");

    // Migrate Users
    console.log("👥 Migrating users...");
    const usersCollection = mongoDb.collection("users");
    const users = await usersCollection.find({}).toArray();

    for (const user of users) {
      try {
        const userData = {
          email: user.email,
          name: user.name,
          password: user.password, // Already hashed
          role: user.role || "employee",
          hasDocumentAccess: user.hasDocumentAccess || false,
          avatar: user.avatar || null,
          createdAt: user.createdAt
            ? new Date(user.createdAt)
            : serverTimestamp(),
          updatedAt: user.updatedAt
            ? new Date(user.updatedAt)
            : serverTimestamp(),
        };

        await addDoc(collection(db, "users"), userData);
        console.log(`  ✅ Migrated user: ${user.email}`);
      } catch (error) {
        console.log(
          `  ⚠️  Failed to migrate user ${user.email}:`,
          error.message
        );
      }
    }

    // Migrate Folders
    console.log("\n📁 Migrating folders...");
    const foldersCollection = mongoDb.collection("folders");
    const folders = await foldersCollection.find({}).toArray();

    for (const folder of folders) {
      try {
        const folderData = {
          name: folder.name,
          parentId: folder.parentId ? folder.parentId.toString() : null,
          path: folder.path,
          level: folder.level || 0,
          permissions: folder.permissions || [],
          createdBy: folder.createdBy ? folder.createdBy.toString() : null,
          createdAt: folder.createdAt
            ? new Date(folder.createdAt)
            : serverTimestamp(),
          updatedAt: folder.updatedAt
            ? new Date(folder.updatedAt)
            : serverTimestamp(),
        };

        await addDoc(collection(db, "folders"), folderData);
        console.log(`  ✅ Migrated folder: ${folder.name}`);
      } catch (error) {
        console.log(
          `  ⚠️  Failed to migrate folder ${folder.name}:`,
          error.message
        );
      }
    }

    // Migrate Tags
    console.log("\n🏷️  Migrating tags...");
    const tagsCollection = mongoDb.collection("tags");
    const tags = await tagsCollection.find({}).toArray();

    for (const tag of tags) {
      try {
        const tagData = {
          name: tag.name,
          description: tag.description || "",
          color: tag.color || "#3B82F6",
          category: tag.category || "general",
          createdBy: tag.createdBy ? tag.createdBy.toString() : null,
          isActive: tag.isActive !== false,
          createdAt: tag.createdAt
            ? new Date(tag.createdAt)
            : serverTimestamp(),
          updatedAt: tag.updatedAt
            ? new Date(tag.updatedAt)
            : serverTimestamp(),
        };

        await addDoc(collection(db, "tags"), tagData);
        console.log(`  ✅ Migrated tag: ${tag.name}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to migrate tag ${tag.name}:`, error.message);
      }
    }

    // Migrate Documents
    console.log("\n📄 Migrating documents...");
    const documentsCollection = mongoDb.collection("documents");
    const documents = await documentsCollection.find({}).toArray();

    for (const document of documents) {
      try {
        const documentData = {
          name: document.name,
          originalName: document.originalName,
          mimeType: document.mimeType,
          size: document.size,
          folderId: document.folderId ? document.folderId.toString() : null,
          firebaseStorageUrl:
            document.firebaseStorageUrl || document.googleDriveUrl || "",
          firebaseStoragePath: document.firebaseStoragePath || "",
          content: document.content || "",
          tags: document.tags || [],
          createdBy: document.createdBy
            ? document.createdBy.toString()
            : document.uploadedBy?.userId
            ? document.uploadedBy.userId.toString()
            : null,
          createdByEmail:
            document.createdByEmail || document.uploadedBy?.email || "",
          createdByName:
            document.createdByName || document.uploadedBy?.name || "",
          version: document.version || 1,
          isLatestVersion: document.isLatestVersion !== false,
          isActive: document.isActive !== false,
          parentDocumentId: document.parentDocumentId
            ? document.parentDocumentId.toString()
            : null,
          versionHistory: document.versionHistory || [],
          createdAt: document.createdAt
            ? new Date(document.createdAt)
            : serverTimestamp(),
          updatedAt: document.updatedAt
            ? new Date(document.updatedAt)
            : serverTimestamp(),
        };

        await addDoc(collection(db, "documents"), documentData);
        console.log(`  ✅ Migrated document: ${document.name}`);
      } catch (error) {
        console.log(
          `  ⚠️  Failed to migrate document ${document.name}:`,
          error.message
        );
      }
    }

    // Close MongoDB connection
    await mongoClient.close();
    console.log("\n✅ Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Update your environment variables to remove MONGODB_URI");
    console.log("2. Ensure Firebase configuration is correct");
    console.log("3. Test the application with the new Firestore backend");
    console.log("4. Remove MongoDB dependencies from package.json");
    console.log("5. Update your deployment configuration");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData();
}

export { migrateData };
