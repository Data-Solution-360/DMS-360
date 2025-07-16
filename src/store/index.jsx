"use client";

import { AuthProvider, useAuth } from "./AuthContext";
import { DocumentProvider, useDocuments } from "./DocumentContext";
import { FolderProvider, useFolders } from "./FolderContext";
import { TagProvider, useTags } from "./TagContext";

// Combined provider component
export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <DocumentProvider>
        <FolderProvider>
          <TagProvider>{children}</TagProvider>
        </FolderProvider>
      </DocumentProvider>
    </AuthProvider>
  );
};

// Export all hooks
export { useAuth, useDocuments, useFolders, useTags };

// Export individual providers for specific use cases
export { AuthProvider, DocumentProvider, FolderProvider, TagProvider };
