import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase.js";

class ClientUploadService {
  /**
   * Upload file with progress tracking
   * @param {File} file - File object
   * @param {string} folderPath - Storage folder path
   * @param {function} onProgress - Progress callback (percentage)
   * @param {function} onStateChange - State change callback
   * @returns {Promise<{downloadURL: string, storagePath: string}>}
   */
  async uploadWithProgress(
    file,
    folderPath = "documents",
    onProgress,
    onStateChange
  ) {
    return new Promise((resolve, reject) => {
      // Create unique filename
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${file.name}`;
      const storagePath = `${folderPath}/${uniqueFileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate progress percentage
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          // Call progress callback
          if (onProgress) {
            onProgress(Math.round(progress));
          }

          // Call state change callback
          if (onStateChange) {
            onStateChange(snapshot.state, progress);
          }
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          try {
            // Get download URL when upload completes
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadURL,
              storagePath,
              fileId: uniqueFileName,
            });
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload multiple files with progress tracking
   * @param {FileList} files - Files to upload
   * @param {string} folderPath - Storage folder path
   * @param {function} onFileProgress - Progress callback per file
   * @param {function} onOverallProgress - Overall progress callback
   * @returns {Promise<Array>}
   */
  async uploadMultipleWithProgress(
    files,
    folderPath,
    onFileProgress,
    onOverallProgress
  ) {
    const fileArray = Array.from(files);
    const uploadPromises = [];
    let completedFiles = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      const uploadPromise = this.uploadWithProgress(
        file,
        folderPath,
        (progress) => {
          // Call per-file progress callback
          if (onFileProgress) {
            onFileProgress(i, file.name, progress);
          }
        }
      ).then((result) => {
        completedFiles++;
        const overallProgress = (completedFiles / fileArray.length) * 100;

        // Call overall progress callback
        if (onOverallProgress) {
          onOverallProgress(Math.round(overallProgress));
        }

        return result;
      });

      uploadPromises.push(uploadPromise);
    }

    return Promise.all(uploadPromises);
  }
}

export const clientUploadService = new ClientUploadService();
