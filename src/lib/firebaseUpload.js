import { adminStorage } from "./firebase-admin.js";

class FirebaseUploadService {
  constructor() {
    this.storage = adminStorage;
  }

  /**
   * Upload a file to Firebase Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @param {string} folderPath - Folder path in storage
   * @returns {Promise<{fileId: string, downloadURL: string, storagePath: string}>}
   */
  async uploadFile(fileBuffer, fileName, mimeType, folderPath = "documents") {
    try {
      // Create a unique file name to avoid conflicts
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${fileName}`;
      const storagePath = `${folderPath}/${uniqueFileName}`;

      // Get the bucket
      const bucket = this.storage.bucket();

      // Create a file reference
      const file = bucket.file(storagePath);

      // Upload the file
      const stream = file.createWriteStream({
        metadata: {
          contentType: mimeType,
        },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on("error", (error) => {
          console.error("Firebase upload error:", error);
          reject(new Error(`Failed to upload file: ${error.message}`));
        });

        stream.on("finish", async () => {
          try {
            // Make the file public and get download URL
            await file.makePublic();
            const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

            resolve({
              fileId: uniqueFileName,
              downloadURL: downloadURL,
              storagePath: storagePath,
            });
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(new Error(`Failed to get download URL: ${error.message}`));
          }
        });

        stream.end(fileBuffer);
      });
    } catch (error) {
      console.error("Firebase upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param {string} storagePath - Storage path of the file
   * @returns {Promise<void>}
   */
  async deleteFile(storagePath) {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(storagePath);
      await file.delete();
    } catch (error) {
      console.error("Firebase delete error:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Copy a file in Firebase Storage (creates a new file)
   * @param {string} sourcePath - Source file path
   * @param {string} destinationPath - Destination file path
   * @returns {Promise<{fileId: string, downloadURL: string, storagePath: string}>}
   */
  async copyFile(sourcePath, destinationPath) {
    try {
      const bucket = this.storage.bucket();
      const sourceFile = bucket.file(sourcePath);
      const destinationFile = bucket.file(destinationPath);

      // Copy the file
      await sourceFile.copy(destinationFile);

      // Make the new file public and get download URL
      await destinationFile.makePublic();
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;

      return {
        fileId: destinationFile.name,
        downloadURL: downloadURL,
        storagePath: destinationPath,
      };
    } catch (error) {
      console.error("Firebase copy error:", error);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Get download URL for a file
   * @param {string} storagePath - Storage path of the file
   * @returns {Promise<string>}
   */
  async getDownloadURL(storagePath) {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(storagePath);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("File not found");
      }

      // Return public URL
      return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    } catch (error) {
      console.error("Firebase get download URL error:", error);
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   * @param {string} storagePath - Storage path of the file
   * @returns {Promise<object>}
   */
  async getFileMetadata(storagePath) {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(storagePath);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error) {
      console.error("Firebase get metadata error:", error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   * @param {string} storagePath - Storage path of the file
   * @returns {Promise<boolean>}
   */
  async fileExists(storagePath) {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(storagePath);
      const [exists] = await file.exists();
      return exists;
    } catch (error) {
      console.error("Firebase file exists check error:", error);
      return false;
    }
  }
}

export const firebaseUploadService = new FirebaseUploadService();
