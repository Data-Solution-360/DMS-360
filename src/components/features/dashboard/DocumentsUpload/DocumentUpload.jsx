"use client";

import { useApi } from "@/hooks/useApi";
import { useMemo, useState } from "react";
import { FiAlertCircle, FiUpload } from "react-icons/fi";
import Swal from "sweetalert2";
import { clientUploadService } from "../../../../lib/clientUpload.js";

// Import modular components
import { DepartmentSelector } from "../../admin";
import FileSelector from "./components/FileSelector.jsx";
import MetadataForm from "./components/MetadataForm.jsx";
import TagSelector from "./components/TagSelector.jsx";
import UploadProgress from "./components/UploadProgress.jsx";

export default function DocumentUploadWithTags({
  folderId,
  onUploadSuccess,
  onCancel,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx",
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [metadata, setMetadata] = useState({
    description: "",
    documentType: "",
    priority: "medium",
    author: "",
    confidentiality: "internal",
    version: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const { apiCall } = useApi();

  // Memoized validation function
  const validationErrors = useMemo(() => {
    const errors = [];

    if (selectedFiles.length === 0) {
      errors.push("Please select at least one file to upload");
    }

    if (selectedTags.length === 0) {
      errors.push("Please select at least one tag");
    }

    selectedFiles.forEach((fileObj) => {
      if (fileObj.file.size > maxFileSize) {
        errors.push(
          `File "${fileObj.file.name}" is too large. Maximum size is ${
            maxFileSize / (1024 * 1024)
          }MB`
        );
      }
    });

    return errors;
  }, [selectedFiles, selectedTags, maxFileSize]);

  const isValid = validationErrors.length === 0;

  // Reset selected tags when department changes
  const handleDepartmentChange = (department) => {
    console.log("Department changed to:", department);
    setSelectedDepartment(department);
    setSelectedTags([]); // Clear selected tags when department changes
  };

  // Enhanced upload function with better error handling
  const handleUpload = async () => {
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setUploading(true);
    setUploadResults([]);
    setUploadProgress({});
    setErrors([]);

    const uploadPromises = selectedFiles.map(async (fileObj) => {
      try {
        // Set initial progress
        setUploadProgress((prev) => ({
          ...prev,
          [fileObj.id]: { status: "uploading", progress: 0 },
        }));

        // Upload to Firebase Storage with progress
        const uploadResult = await clientUploadService.uploadWithProgress(
          fileObj.file,
          folderId ? `folders/${folderId}/documents` : "documents",
          (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileObj.id]: { status: "uploading", progress },
            }));
          }
        );

        // Prepare document metadata including new fields
        const documentData = {
          fileName: fileObj.file.name,
          originalName: fileObj.file.name,
          mimeType: fileObj.file.type,
          size: fileObj.file.size,
          folderId: folderId,
          firebaseStorageUrl: uploadResult.downloadURL,
          firebaseStoragePath: uploadResult.storagePath,
          tags: selectedTags,
          // Add metadata fields
          description: metadata.description || "",
          documentType: metadata.documentType || "",
          priority: metadata.priority || "medium",
          author: metadata.author || "",
          confidentiality: metadata.confidentiality || "internal",
          version: metadata.version || "",
        };

        // Save document metadata using authenticated API call
        const data = await apiCall("/api/documents/upload", {
          method: "POST",
          body: JSON.stringify(documentData),
        });

        if (data.success) {
          setUploadProgress((prev) => ({
            ...prev,
            [fileObj.id]: { status: "completed", progress: 100 },
          }));

          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            status: "success",
            data: data.data,
          };
        } else {
          setUploadProgress((prev) => ({
            ...prev,
            [fileObj.id]: { status: "error", error: data.error },
          }));

          return {
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            status: "error",
            error: data.error,
          };
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadProgress((prev) => ({
          ...prev,
          [fileObj.id]: { status: "error", error: error.message },
        }));

        return {
          fileId: fileObj.id,
          fileName: fileObj.file.name,
          status: "error",
          error: error.message,
        };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      setUploadResults(results);

      // Check if all uploads were successful
      const successfulUploads = results.filter((r) => r.status === "success");
      const failedUploads = results.filter((r) => r.status === "error");

      if (successfulUploads.length > 0) {
        // Show success alert
        const uploadCount = successfulUploads.length;
        const fileNames = successfulUploads
          .map((upload) => upload.fileName)
          .join(", ");

        await Swal.fire({
          title: "Upload Successful! 🎉",
          html: `
            <div class="text-left">
              <p class="mb-3"><strong>${uploadCount} document${
            uploadCount > 1 ? "s" : ""
          } uploaded successfully!</strong></p>
              <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p class="text-sm text-green-800 font-medium">Uploaded files:</p>
                <p class="text-sm text-green-700 mt-1">${fileNames}</p>
              </div>
              <p class="text-sm text-gray-600">Your documents are now available in the system.</p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "Great!",
          confirmButtonColor: "#3B82F6",
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });

        // Call the onUploadSuccess callback
        if (onUploadSuccess) {
          onUploadSuccess(successfulUploads);
        }
      }

      if (failedUploads.length > 0) {
        // Show error alert for failed uploads
        const failedCount = failedUploads.length;
        const failedFileNames = failedUploads
          .map((upload) => upload.fileName)
          .join(", ");

        await Swal.fire({
          title: "Some Uploads Failed ⚠️",
          html: `
            <div class="text-left">
              <p class="mb-3"><strong>${failedCount} document${
            failedCount > 1 ? "s" : ""
          } failed to upload.</strong></p>
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p class="text-sm text-red-800 font-medium">Failed files:</p>
                <p class="text-sm text-red-700 mt-1">${failedFileNames}</p>
              </div>
              <p class="text-sm text-gray-600">Please check the error details and try again.</p>
            </div>
          `,
          icon: "warning",
          confirmButtonText: "OK",
          confirmButtonColor: "#EF4444",
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });

        setErrors(failedUploads.map((f) => `${f.fileName}: ${f.error}`));
      }
    } catch (error) {
      console.error("Upload batch error:", error);

      // Show error alert for batch failure
      await Swal.fire({
        title: "Upload Failed ❌",
        text: "An unexpected error occurred during upload. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });

      setErrors(["Upload failed. Please try again."]);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (!uploading && onCancel) {
      onCancel();
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const handleRemoveFile = (fileId) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((fileObj) => fileObj.id !== fileId)
    );
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
        <p className="mt-1 text-sm text-gray-600">
          Select files, choose department and tags, then upload your documents.
        </p>
      </div>

      {/* File Selection */}
      <FileSelector
        selectedFiles={selectedFiles}
        onFileSelect={setSelectedFiles}
        onRemoveFile={handleRemoveFile}
        maxFileSize={maxFileSize}
        acceptedFileTypes={acceptedFileTypes}
        uploading={uploading}
      />

      {/* Department Selection */}
      <DepartmentSelector
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleDepartmentChange}
        uploading={uploading}
      />

      {/* Tag Selection */}
      <TagSelector
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        selectedDepartment={selectedDepartment}
        uploading={uploading}
      />

      {/* Metadata Form */}
      <MetadataForm
        metadata={metadata}
        onMetadataChange={setMetadata}
        uploading={uploading}
      />

      {/* Upload Progress */}
      {uploading && (
        <UploadProgress
          uploadProgress={uploadProgress}
          selectedFiles={selectedFiles}
          uploadResults={uploadResults}
        />
      )}

      {/* Validation Errors */}
      {!uploading && validationErrors.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Please fix the following issues:
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Runtime Errors */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Upload Errors
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <button
                  onClick={clearErrors}
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && !uploading && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Upload Results</h4>
          {uploadResults.map((result) => (
            <div
              key={result.fileId}
              className={`p-3 rounded-md border ${
                result.status === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{result.fileName}</span>
                <span className="text-xs">
                  {result.status === "success" ? "✓ Uploaded" : "✗ Failed"}
                </span>
              </div>
              {result.error && (
                <div className="mt-1 text-xs">{result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleCancel}
          disabled={uploading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!isValid || uploading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <FiUpload className="mr-2 h-4 w-4" />
              Upload Documents
            </>
          )}
        </button>
      </div>
    </div>
  );
}
