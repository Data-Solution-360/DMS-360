import {
  getDownloadURL,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "./firebase";

export function uploadFileToFirebase(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    console.log("[Firebase] Starting upload:", file.name, "to", path);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
        console.log(`[Firebase] Upload progress: ${progress}%`);
      },
      (error) => {
        console.error("[Firebase] Upload error:", error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            console.log(
              "[Firebase] Upload complete. Download URL:",
              downloadURL
            );
            resolve(downloadURL);
          })
          .catch((err) => {
            console.error("[Firebase] Error getting download URL:", err);
            reject(err);
          });
      }
    );
  });
}

// Test function to check Firebase Storage connection
export async function testFirebaseStorageConnection() {
  try {
    console.log("[Firebase] Testing storage connection...");
    console.log(
      "[Firebase] Storage bucket:",
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    );

    const rootRef = ref(storage);
    console.log("[Firebase] Root reference created:", rootRef);

    const result = await listAll(rootRef);
    console.log(
      "[Firebase] Storage connection successful. Root items:",
      result.items
    );
    return true;
  } catch (err) {
    console.error("[Firebase] Storage connection failed:", err);
    console.error("[Firebase] Error code:", err.code);
    console.error("[Firebase] Error message:", err.message);

    // Check if it's a configuration issue
    if (err.code === "storage/unauthorized") {
      console.error("[Firebase] Unauthorized - check Storage rules");
    } else if (err.code === "storage/retry-limit-exceeded") {
      console.error(
        "[Firebase] Retry limit exceeded - check bucket name and network"
      );
    }

    return false;
  }
}

// Alternative test - try uploading a small test file
export async function testFirebaseUpload() {
  try {
    console.log("[Firebase] Testing upload...");

    // Create a simple test file
    const testContent = "Hello Firebase Storage!";
    const testFile = new Blob([testContent], { type: "text/plain" });

    const testPath = `test-${Date.now()}.txt`;
    const testRef = ref(storage, testPath);

    console.log("[Firebase] Uploading test file:", testPath);

    const snapshot = await uploadBytesResumable(testRef, testFile);
    console.log("[Firebase] Test upload successful:", snapshot);

    // Clean up - delete the test file
    // Note: You'll need to implement delete functionality if needed

    return true;
  } catch (err) {
    console.error("[Firebase] Test upload failed:", err);
    console.error("[Firebase] Error code:", err.code);
    console.error("[Firebase] Error message:", err.message);
    return false;
  }
}
