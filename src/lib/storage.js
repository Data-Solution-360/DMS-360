import { Storage } from "@google-cloud/storage";

class CloudStorageService {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });
    this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async deleteFile(filePath) {
    try {
      if (!filePath) {
        throw new Error("File path is required");
      }

      // Remove leading slash if present
      const cleanPath = filePath.startsWith("/")
        ? filePath.substring(1)
        : filePath;

      const file = this.bucket.file(cleanPath);

      // Check if file exists before trying to delete
      const [exists] = await file.exists();
      if (!exists) {
        console.warn(`File ${cleanPath} does not exist in storage`);
        return { success: true, message: "File does not exist" };
      }

      await file.delete();
      console.log(`Successfully deleted file: ${cleanPath}`);

      return {
        success: true,
        message: `File ${cleanPath} deleted successfully`,
      };
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async deleteMultipleFiles(filePaths) {
    const results = {
      successful: [],
      failed: [],
    };

    for (const filePath of filePaths) {
      try {
        await this.deleteFile(filePath);
        results.successful.push(filePath);
      } catch (error) {
        results.failed.push({
          path: filePath,
          error: error.message,
        });
      }
    }

    return results;
  }

  async listOrphanedFiles() {
    try {
      // Get all files from storage
      const [files] = await this.bucket.getFiles();

      // Get all file paths from Firestore documents
      const documents = await DocumentService.getAllDocuments();
      const activeFilePaths = new Set();

      documents.forEach((doc) => {
        if (doc.filePath) activeFilePaths.add(doc.filePath);
        if (doc.thumbnailPath) activeFilePaths.add(doc.thumbnailPath);
      });

      // Find orphaned files
      const orphanedFiles = [];
      let orphanedSize = 0;

      for (const file of files) {
        const filePath = file.name;

        // Skip if file is referenced in database
        if (
          activeFilePaths.has(filePath) ||
          activeFilePaths.has(`/${filePath}`)
        ) {
          continue;
        }

        const [metadata] = await file.getMetadata();
        const size = parseInt(metadata.size) || 0;

        orphanedFiles.push({
          path: filePath,
          size: size,
          created: metadata.timeCreated,
          lastModified: metadata.updated,
        });

        orphanedSize += size;
      }

      return {
        files: orphanedFiles,
        count: orphanedFiles.length,
        totalSize: orphanedSize,
      };
    } catch (error) {
      console.error("Error listing orphaned files:", error);
      throw error;
    }
  }

  async cleanupOrphanedFiles(olderThanDays = 7) {
    try {
      const orphanedFiles = await this.listOrphanedFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const filesToDelete = orphanedFiles.files.filter(
        (file) => new Date(file.lastModified) < cutoffDate
      );

      const results = await this.deleteMultipleFiles(
        filesToDelete.map((f) => f.path)
      );

      return {
        total: filesToDelete.length,
        successful: results.successful.length,
        failed: results.failed.length,
        failedFiles: results.failed,
        sizeFreed: filesToDelete
          .filter((f) => results.successful.includes(f.path))
          .reduce((total, f) => total + f.size, 0),
      };
    } catch (error) {
      console.error("Error cleaning up orphaned files:", error);
      throw error;
    }
  }
}

export const cloudStorageService = new CloudStorageService();
export { CloudStorageService };
