"use client";

import { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  folders: [],
  currentFolder: null,
  folderTree: [],
  isLoading: false,
  error: null,
};

// Action types
const FOLDER_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_FOLDERS: "SET_FOLDERS",
  ADD_FOLDER: "ADD_FOLDER",
  UPDATE_FOLDER: "UPDATE_FOLDER",
  DELETE_FOLDER: "DELETE_FOLDER",
  SET_CURRENT_FOLDER: "SET_CURRENT_FOLDER",
  SET_FOLDER_TREE: "SET_FOLDER_TREE",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer function
const folderReducer = (state, action) => {
  switch (action.type) {
    case FOLDER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case FOLDER_ACTIONS.SET_FOLDERS:
      return {
        ...state,
        folders: action.payload,
        isLoading: false,
        error: null,
      };
    case FOLDER_ACTIONS.ADD_FOLDER:
      return {
        ...state,
        folders: [...state.folders, action.payload],
        isLoading: false,
        error: null,
      };
    case FOLDER_ACTIONS.UPDATE_FOLDER:
      return {
        ...state,
        folders: state.folders.map((folder) =>
          folder._id === action.payload._id ? action.payload : folder
        ),
        currentFolder:
          state.currentFolder?._id === action.payload._id
            ? action.payload
            : state.currentFolder,
        isLoading: false,
        error: null,
      };
    case FOLDER_ACTIONS.DELETE_FOLDER:
      return {
        ...state,
        folders: state.folders.filter(
          (folder) => folder._id !== action.payload
        ),
        currentFolder:
          state.currentFolder?._id === action.payload
            ? null
            : state.currentFolder,
        isLoading: false,
        error: null,
      };
    case FOLDER_ACTIONS.SET_CURRENT_FOLDER:
      return {
        ...state,
        currentFolder: action.payload,
      };
    case FOLDER_ACTIONS.SET_FOLDER_TREE:
      return {
        ...state,
        folderTree: action.payload,
      };
    case FOLDER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case FOLDER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const FolderContext = createContext();

// Helper function to build folder tree
const buildFolderTree = (folders, parentId = null) => {
  return folders
    .filter((folder) => folder.parentId === parentId)
    .map((folder) => ({
      ...folder,
      children: buildFolderTree(folders, folder._id),
    }));
};

// Provider component
export const FolderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(folderReducer, initialState);

  const fetchFolders = async () => {
    dispatch({ type: FOLDER_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch("/api/folders");

      if (response.ok) {
        const folders = await response.json();
        const folderTree = buildFolderTree(folders);

        dispatch({ type: FOLDER_ACTIONS.SET_FOLDERS, payload: folders });
        dispatch({ type: FOLDER_ACTIONS.SET_FOLDER_TREE, payload: folderTree });
      } else {
        throw new Error("Failed to fetch folders");
      }
    } catch (error) {
      dispatch({ type: FOLDER_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const createFolder = async (folderData) => {
    dispatch({ type: FOLDER_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderData),
      });

      if (response.ok) {
        const folder = await response.json();
        dispatch({ type: FOLDER_ACTIONS.ADD_FOLDER, payload: folder });

        // Refresh folder tree
        await fetchFolders();

        return { success: true, folder };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create folder");
      }
    } catch (error) {
      dispatch({ type: FOLDER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateFolder = async (folderId, updates) => {
    dispatch({ type: FOLDER_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const folder = await response.json();
        dispatch({ type: FOLDER_ACTIONS.UPDATE_FOLDER, payload: folder });

        // Refresh folder tree
        await fetchFolders();

        return { success: true, folder };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update folder");
      }
    } catch (error) {
      dispatch({ type: FOLDER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const deleteFolder = async (folderId) => {
    dispatch({ type: FOLDER_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        dispatch({ type: FOLDER_ACTIONS.DELETE_FOLDER, payload: folderId });

        // Refresh folder tree
        await fetchFolders();

        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete folder");
      }
    } catch (error) {
      dispatch({ type: FOLDER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const getFolderPermissions = async (folderId) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/permissions`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to fetch folder permissions");
      }
    } catch (error) {
      dispatch({ type: FOLDER_ACTIONS.SET_ERROR, payload: error.message });
      return [];
    }
  };

  const updateFolderPermissions = async (folderId, userId, permissions) => {
    try {
      const response = await fetch(
        `/api/folders/${folderId}/permissions/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(permissions),
        }
      );

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update permissions");
      }
    } catch (error) {
      dispatch({ type: FOLDER_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const setCurrentFolder = (folder) => {
    dispatch({ type: FOLDER_ACTIONS.SET_CURRENT_FOLDER, payload: folder });
  };

  const clearError = () => {
    dispatch({ type: FOLDER_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderPermissions,
    updateFolderPermissions,
    setCurrentFolder,
    clearError,
  };

  return (
    <FolderContext.Provider value={value}>{children}</FolderContext.Provider>
  );
};

// Custom hook to use folder context
export const useFolders = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolders must be used within a FolderProvider");
  }
  return context;
};
