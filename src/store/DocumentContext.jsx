"use client";

import { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    tags: [],
    dateRange: null,
    folderId: null,
  },
};

// Action types
const DOCUMENT_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_DOCUMENTS: "SET_DOCUMENTS",
  ADD_DOCUMENT: "ADD_DOCUMENT",
  UPDATE_DOCUMENT: "UPDATE_DOCUMENT",
  DELETE_DOCUMENT: "DELETE_DOCUMENT",
  SET_CURRENT_DOCUMENT: "SET_CURRENT_DOCUMENT",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_FILTERS: "SET_FILTERS",
  CLEAR_FILTERS: "CLEAR_FILTERS",
};

// Reducer function
const documentReducer = (state, action) => {
  switch (action.type) {
    case DOCUMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case DOCUMENT_ACTIONS.SET_DOCUMENTS:
      return {
        ...state,
        documents: action.payload,
        isLoading: false,
        error: null,
      };
    case DOCUMENT_ACTIONS.ADD_DOCUMENT:
      return {
        ...state,
        documents: [action.payload, ...state.documents],
        isLoading: false,
        error: null,
      };
    case DOCUMENT_ACTIONS.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc._id === action.payload._id ? action.payload : doc
        ),
        currentDocument:
          state.currentDocument?._id === action.payload._id
            ? action.payload
            : state.currentDocument,
        isLoading: false,
        error: null,
      };
    case DOCUMENT_ACTIONS.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter((doc) => doc._id !== action.payload),
        currentDocument:
          state.currentDocument?._id === action.payload
            ? null
            : state.currentDocument,
        isLoading: false,
        error: null,
      };
    case DOCUMENT_ACTIONS.SET_CURRENT_DOCUMENT:
      return {
        ...state,
        currentDocument: action.payload,
      };
    case DOCUMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case DOCUMENT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case DOCUMENT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case DOCUMENT_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };
    default:
      return state;
  }
};

// Create context
const DocumentContext = createContext();

// Provider component
export const DocumentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  const fetchDocuments = async (folderId = null) => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const url = folderId
        ? `/api/documents?folderId=${folderId}`
        : "/api/documents";
      const response = await fetch(url);

      if (response.ok) {
        const documents = await response.json();
        dispatch({ type: DOCUMENT_ACTIONS.SET_DOCUMENTS, payload: documents });
      } else {
        throw new Error("Failed to fetch documents");
      }
    } catch (error) {
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const uploadDocument = async (formData) => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const document = await response.json();
        dispatch({ type: DOCUMENT_ACTIONS.ADD_DOCUMENT, payload: document });
        return { success: true, document };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
    } catch (error) {
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateDocument = async (documentId, updates) => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const document = await response.json();
        dispatch({ type: DOCUMENT_ACTIONS.UPDATE_DOCUMENT, payload: document });
        return { success: true, document };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Update failed");
      }
    } catch (error) {
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const deleteDocument = async (documentId) => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        dispatch({
          type: DOCUMENT_ACTIONS.DELETE_DOCUMENT,
          payload: documentId,
        });
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Delete failed");
      }
    } catch (error) {
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const restoreDocument = async (documentId) => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/documents/${documentId}/restore`, {
        method: "POST",
      });

      if (response.ok) {
        const document = await response.json();
        dispatch({ type: DOCUMENT_ACTIONS.ADD_DOCUMENT, payload: document });
        return { success: true, document };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Restore failed");
      }
    } catch (error) {
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const getDocumentVersions = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to fetch versions");
      }
    } catch (error) {
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      return [];
    }
  };

  const setCurrentDocument = (document) => {
    dispatch({
      type: DOCUMENT_ACTIONS.SET_CURRENT_DOCUMENT,
      payload: document,
    });
  };

  const setFilters = (filters) => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_FILTERS, payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: DOCUMENT_ACTIONS.CLEAR_FILTERS });
  };

  const clearError = () => {
    dispatch({ type: DOCUMENT_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    restoreDocument,
    getDocumentVersions,
    setCurrentDocument,
    setFilters,
    clearFilters,
    clearError,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

// Custom hook to use document context
export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};
