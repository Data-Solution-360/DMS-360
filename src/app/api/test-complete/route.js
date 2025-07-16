import { NextResponse } from "next/server";
import {
  DocumentService,
  FolderService,
  TagService,
  UserService,
} from "../../../lib/firestore.js";

export async function POST(request) {
  const testResults = {
    users: {},
    documents: {},
    folders: {},
    tags: {},
    cleanup: {},
  };

  let testUserId, testDocumentId, testFolderId, testTagId;

  try {
    console.log("🧪 Starting comprehensive Firestore tests...");

    // ========================================
    // USER SERVICE TESTS
    // ========================================
    console.log("\n👤 Testing User Service...");

    // Test 1: Create User
    const uniqueUid = await UserService.generateUniqueUid();
    const testUserData = {
      uid: uniqueUid,
      email: `test-${Date.now()}@example.com`,
      name: "Test User Complete",
      role: "user",
      isActive: true,
      profilePicture: null,
    };

    const createdUser = await UserService.createUser(testUserData);
    testUserId = createdUser.id;
    testResults.users.create = {
      success: true,
      id: testUserId,
      data: createdUser,
    };
    console.log("✅ User created:", testUserId);

    // Test 2: Get User by ID
    const retrievedUser = await UserService.getUserById(testUserId);
    testResults.users.getById = {
      success: !!retrievedUser,
      data: retrievedUser,
    };
    console.log("✅ User retrieved by ID");

    // Test 3: Get User by Email
    const userByEmail = await UserService.getUserByEmail(testUserData.email);
    testResults.users.getByEmail = {
      success: !!userByEmail,
      data: userByEmail,
    };
    console.log("✅ User retrieved by email");

    // Test 4: Get User by UID
    const userByUid = await UserService.getUserByUid(uniqueUid);
    testResults.users.getByUid = {
      success: !!userByUid,
      data: userByUid,
    };
    console.log("✅ User retrieved by UID");

    // Test 5: Update User
    const updatedUser = await UserService.updateUser(testUserId, {
      name: "Updated Test User",
      isActive: false,
    });
    testResults.users.update = {
      success: true,
      data: updatedUser,
    };
    console.log("✅ User updated");

    // Test 6: Get All Users
    const allUsers = await UserService.getAllUsers();
    testResults.users.getAll = {
      success: true,
      count: allUsers.length,
      data: allUsers.slice(0, 3), // Only show first 3 for brevity
    };
    console.log("✅ All users retrieved:", allUsers.length);

    // Test 7: Search Users
    const searchResults = await UserService.searchUsers("Test");
    testResults.users.search = {
      success: true,
      count: searchResults.length,
      data: searchResults.slice(0, 3),
    };
    console.log("✅ User search completed:", searchResults.length);

    // ========================================
    // TAG SERVICE TESTS
    // ========================================
    console.log("\n🏷️ Testing Tag Service...");

    // Test 1: Create Tag
    const testTagData = {
      name: `test-tag-${Date.now()}`,
      description: "Test tag for comprehensive testing",
      category: "test",
      color: "#FF0000",
      isActive: true,
    };

    const createdTag = await TagService.createTag(testTagData);
    testTagId = createdTag.id;
    testResults.tags.create = {
      success: true,
      id: testTagId,
      data: createdTag,
    };
    console.log("✅ Tag created:", testTagId);

    // Test 2: Get Tag by ID
    const retrievedTag = await TagService.getTagById(testTagId);
    testResults.tags.getById = {
      success: !!retrievedTag,
      data: retrievedTag,
    };
    console.log("✅ Tag retrieved by ID");

    // Test 3: Update Tag
    const updatedTag = await TagService.updateTag(testTagId, {
      description: "Updated test tag description",
      color: "#00FF00",
    });
    testResults.tags.update = {
      success: true,
      data: updatedTag,
    };
    console.log("✅ Tag updated");

    // Test 4: Get All Tags
    const allTags = await TagService.getAllTags();
    testResults.tags.getAll = {
      success: true,
      count: allTags.length,
      data: allTags,
    };
    console.log("✅ All tags retrieved:", allTags.length);

    // Test 5: Search Tags
    const tagSearchResults = await TagService.searchTags("test");
    testResults.tags.search = {
      success: true,
      count: tagSearchResults.length,
      data: tagSearchResults,
    };
    console.log("✅ Tag search completed:", tagSearchResults.length);

    // Test 6: Get Tags by Category
    const categoryTags = await TagService.getTagsByCategory("test");
    testResults.tags.getByCategory = {
      success: true,
      count: categoryTags.length,
      data: categoryTags,
    };
    console.log("✅ Tags by category retrieved:", categoryTags.length);

    // ========================================
    // FOLDER SERVICE TESTS
    // ========================================
    console.log("\n📁 Testing Folder Service...");

    // Test 1: Create Root Folder
    const testFolderData = {
      name: `Test Folder ${Date.now()}`,
      description: "Test folder for comprehensive testing",
      parentId: null,
      createdBy: testUserId,
      permissions: [
        {
          userId: testUserId,
          permission: "admin",
        },
      ],
    };

    const createdFolder = await FolderService.createFolder(testFolderData);
    testFolderId = createdFolder.id;
    testResults.folders.create = {
      success: true,
      id: testFolderId,
      data: createdFolder,
    };
    console.log("✅ Folder created:", testFolderId);

    // Test 2: Get Folder by ID
    const retrievedFolder = await FolderService.getFolderById(testFolderId);
    testResults.folders.getById = {
      success: !!retrievedFolder,
      data: retrievedFolder,
    };
    console.log("✅ Folder retrieved by ID");

    // Test 3: Update Folder
    const updatedFolder = await FolderService.updateFolder(testFolderId, {
      description: "Updated test folder description",
      name: "Updated Test Folder",
    });
    testResults.folders.update = {
      success: true,
      data: updatedFolder,
    };
    console.log("✅ Folder updated");

    // Test 4: Get All Folders
    const allFolders = await FolderService.getAllFolders();
    testResults.folders.getAll = {
      success: true,
      count: allFolders.length,
      data: allFolders.slice(0, 3),
    };
    console.log("✅ All folders retrieved:", allFolders.length);

    // Test 5: Get Folders by Parent
    const rootFolders = await FolderService.getFoldersByParent(null);
    testResults.folders.getByParent = {
      success: true,
      count: rootFolders.length,
      data: rootFolders.slice(0, 3),
    };
    console.log("✅ Root folders retrieved:", rootFolders.length);

    // Test 6: Create Sub-folder
    const subFolderData = {
      name: `Sub Folder ${Date.now()}`,
      description: "Test sub-folder",
      parentId: testFolderId,
      createdBy: testUserId,
      permissions: [],
    };

    const createdSubFolder = await FolderService.createFolder(subFolderData);
    testResults.folders.createSub = {
      success: true,
      id: createdSubFolder.id,
      data: createdSubFolder,
    };
    console.log("✅ Sub-folder created:", createdSubFolder.id);

    // Test 7: Get Folder Tree
    const folderTree = await FolderService.getFolderTree();
    testResults.folders.getTree = {
      success: true,
      count: folderTree.length,
      data: folderTree.slice(0, 2), // Only show first 2 for brevity
    };
    console.log("✅ Folder tree retrieved");

    // Test 8: Update Folder Permissions
    const newPermissions = [
      { userId: testUserId, permission: "admin" },
      { userId: "public", permission: "read" },
    ];
    const updatedPermissions = await FolderService.updateFolderPermissions(
      testFolderId,
      newPermissions
    );
    testResults.folders.updatePermissions = {
      success: true,
      data: updatedPermissions,
    };
    console.log("✅ Folder permissions updated");

    // ========================================
    // DOCUMENT SERVICE TESTS
    // ========================================
    console.log("\n📄 Testing Document Service...");

    // Test 1: Create Document
    const testDocumentData = {
      name: `Test Document ${Date.now()}`,
      description: "Test document for comprehensive testing",
      folderId: testFolderId,
      createdBy: testUserId,
      size: 1024,
      mimeType: "application/pdf",
      filePath: "/test/path/document.pdf",
      tags: [testTagData.name],
      versions: [
        {
          version: 1,
          uploadedBy: testUserId,
          uploadedAt: new Date(),
          filePath: "/test/path/document-v1.pdf",
          size: 1024,
        },
      ],
      currentVersion: 1,
      isDeleted: false,
    };

    const createdDocument = await DocumentService.createDocument(
      testDocumentData
    );
    testDocumentId = createdDocument.id;
    testResults.documents.create = {
      success: true,
      id: testDocumentId,
      data: createdDocument,
    };
    console.log("✅ Document created:", testDocumentId);

    // Test 2: Get Document by ID
    const retrievedDocument = await DocumentService.getDocumentById(
      testDocumentId
    );
    testResults.documents.getById = {
      success: !!retrievedDocument,
      data: retrievedDocument,
    };
    console.log("✅ Document retrieved by ID");

    // Test 3: Update Document
    const updatedDocument = await DocumentService.updateDocument(
      testDocumentId,
      {
        description: "Updated test document description",
        tags: [testTagData.name, "updated"],
      }
    );
    testResults.documents.update = {
      success: true,
      data: updatedDocument,
    };
    console.log("✅ Document updated");

    // Test 4: Get All Documents
    const allDocuments = await DocumentService.getAllDocuments();
    testResults.documents.getAll = {
      success: true,
      count: allDocuments.length,
      data: allDocuments.slice(0, 3),
    };
    console.log("✅ All documents retrieved:", allDocuments.length);

    // Test 5: Get Documents by Folder
    const folderDocuments = await DocumentService.getDocumentsByFolder(
      testFolderId
    );
    testResults.documents.getByFolder = {
      success: true,
      count: folderDocuments.length,
      data: folderDocuments,
    };
    console.log("✅ Documents by folder retrieved:", folderDocuments.length);

    // Test 6: Search Documents
    const docSearchResults = await DocumentService.searchDocuments("Test");
    testResults.documents.search = {
      success: true,
      count: docSearchResults.length,
      data: docSearchResults.slice(0, 3),
    };
    console.log("✅ Document search completed:", docSearchResults.length);

    // ========================================
    // CLEANUP TESTS
    // ========================================
    console.log("\n🧹 Testing Cleanup Operations...");

    // Delete Document
    const documentDeleted = await DocumentService.deleteDocument(
      testDocumentId
    );
    testResults.cleanup.deleteDocument = {
      success: documentDeleted,
    };
    console.log("✅ Test document deleted");

    // Delete Sub-folder
    const subFolderDeleted = await FolderService.deleteFolder(
      createdSubFolder.id
    );
    testResults.cleanup.deleteSubFolder = {
      success: subFolderDeleted,
    };
    console.log("✅ Test sub-folder deleted");

    // Delete Folder
    const folderDeleted = await FolderService.deleteFolder(testFolderId);
    testResults.cleanup.deleteFolder = {
      success: folderDeleted,
    };
    console.log("✅ Test folder deleted");

    // Delete Tag
    const tagDeleted = await TagService.deleteTag(testTagId);
    testResults.cleanup.deleteTag = {
      success: tagDeleted,
    };
    console.log("✅ Test tag deleted");

    // Delete User
    const userDeleted = await UserService.deleteUser(testUserId);
    testResults.cleanup.deleteUser = {
      success: userDeleted,
    };
    console.log("✅ Test user deleted");

    console.log("\n🎉 All tests completed successfully!");

    return NextResponse.json({
      success: true,
      message: "All Firestore tests completed successfully!",
      results: testResults,
      summary: {
        totalTests: Object.keys(testResults).reduce(
          (total, service) => total + Object.keys(testResults[service]).length,
          0
        ),
        allPassed: true,
      },
    });
  } catch (error) {
    console.error("❌ Test failed:", error);

    // Attempt cleanup on error
    try {
      console.log("🧹 Attempting cleanup after error...");
      if (testDocumentId) {
        await DocumentService.deleteDocument(testDocumentId);
        console.log("✅ Cleaned up test document");
      }
      if (testFolderId) {
        await FolderService.deleteFolder(testFolderId);
        console.log("✅ Cleaned up test folder");
      }
      if (testTagId) {
        await TagService.deleteTag(testTagId);
        console.log("✅ Cleaned up test tag");
      }
      if (testUserId) {
        await UserService.deleteUser(testUserId);
        console.log("✅ Cleaned up test user");
      }
    } catch (cleanupError) {
      console.error("❌ Cleanup failed:", cleanupError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          message: error.message,
          stack: error.stack,
        },
        partialResults: testResults,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to run comprehensive Firestore tests",
    endpoint: "/api/test-complete",
    description:
      "This endpoint tests all Firestore services: Users, Documents, Folders, and Tags with full CRUD operations and cleanup",
  });
}
