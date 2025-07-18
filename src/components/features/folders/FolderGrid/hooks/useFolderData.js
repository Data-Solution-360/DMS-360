"use client";

import { useEffect, useState } from "react";

export function useFolderData(propFolders, selectedFolder, onFoldersUpdate) {
  const [folders, setFolders] = useState(propFolders || []);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Update local folders state when propFolders changes
  useEffect(() => {
    if (propFolders) {
      setFolders(propFolders);
    }
  }, [propFolders]);

  useEffect(() => {
    if (propFolders) {
      setFolders(propFolders);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [propFolders]);

  // Fetch documents when selected folder changes
  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedFolder]);

  const fetchFolders = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/folders", {
        credentials: "include", // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setFolders(data.data);
          // Notify parent component about the update
          if (onFoldersUpdate) {
            onFoldersUpdate(data.data);
          }
        } else {
          console.error("Invalid response format:", data);
          setFolders([]);
        }
      } else {
        console.error("Failed to fetch folders:", response.status);
        try {
          const errorData = await response.json();
          console.error("Error data:", errorData);
        } catch (e) {
          console.error("Could not parse error response");
        }

        // For development, create some demo folders if auth fails
        if (response.status === 401 && process.env.NODE_ENV === "development") {
          const demoFolders = [
            {
              id: "demo-folder-1",
              name: "Demo Folder 1",
              parentId: null,
              path: "demo-folder-1",
              level: 0,
              permissions: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "demo-folder-2",
              name: "Demo Folder 2",
              parentId: null,
              path: "demo-folder-2",
              level: 0,
              permissions: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setFolders(demoFolders);
          if (onFoldersUpdate) {
            onFoldersUpdate(demoFolders);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      // For development, create demo folders if error
      if (process.env.NODE_ENV === "development") {
        const demoFolders = [
          {
            id: "demo-folder-1",
            name: "Demo Folder 1",
            parentId: null,
            path: "demo-folder-1",
            level: 0,
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "demo-folder-2",
            name: "Demo Folder 2",
            parentId: null,
            path: "demo-folder-2",
            level: 0,
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setFolders(demoFolders);
        if (onFoldersUpdate) {
          onFoldersUpdate(demoFolders);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      // Check if this is a test folder (starts with "test-" or "demo-")
      const isTestFolder =
        selectedFolder?.id?.startsWith("test-") ||
        selectedFolder?.id?.startsWith("demo-");

      if (isTestFolder) {        // For test folders, create some demo documents
        const demoDocuments = [
          {
            id: `demo-doc-${selectedFolder.id}-1`,
            name: "Sample Document 1",
            originalName: "sample1.pdf",
            mimeType: "application/pdf",
            size: 1024000,
            folderId: selectedFolder.id,
            firebaseStorageUrl: "#",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: `demo-doc-${selectedFolder.id}-2`,
            name: "Sample Document 2",
            originalName: "sample2.docx",
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            size: 512000,
            folderId: selectedFolder.id,
            firebaseStorageUrl: "#",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        // Add more documents for subfolders
        if (selectedFolder.id.includes("subfolder")) {
          demoDocuments.push({
            id: `demo-doc-${selectedFolder.id}-3`,
            name: "Subfolder Document",
            originalName: "subfolder-doc.txt",
            mimeType: "text/plain",
            size: 256000,
            folderId: selectedFolder.id,
            firebaseStorageUrl: "#",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        setDocuments(demoDocuments);
        return;
      }

      let url = "/api/documents";
      if (selectedFolder) {
        url += `?folderId=${selectedFolder.id}`;
      }

      const response = await fetch(url, {
        credentials: "include", // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      } else {
        console.error("Failed to fetch documents:", response.status);
        try {
          const errorData = await response.json();
          console.error("Error data:", errorData);
        } catch (e) {
          console.error("Could not parse error response");
        }

        // If it's an auth error and we're in development, create demo documents
        if (response.status === 401 && process.env.NODE_ENV === "development") {
          setDocuments([]);
        } else {
          // For any other error, set empty array
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      // For any error, set empty array
      setDocuments([]);
    }
  };

  return {
    folders,
    documents,
    loading,
    refreshing,
    fetchFolders,
    fetchDocuments,
  };
}
