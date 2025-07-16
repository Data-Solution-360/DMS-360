"use client";

import { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  tags: [],
  selectedTags: [],
  isLoading: false,
  error: null,
};

// Action types
const TAG_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_TAGS: "SET_TAGS",
  ADD_TAG: "ADD_TAG",
  UPDATE_TAG: "UPDATE_TAG",
  DELETE_TAG: "DELETE_TAG",
  SET_SELECTED_TAGS: "SET_SELECTED_TAGS",
  ADD_SELECTED_TAG: "ADD_SELECTED_TAG",
  REMOVE_SELECTED_TAG: "REMOVE_SELECTED_TAG",
  CLEAR_SELECTED_TAGS: "CLEAR_SELECTED_TAGS",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer function
const tagReducer = (state, action) => {
  switch (action.type) {
    case TAG_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case TAG_ACTIONS.SET_TAGS:
      return {
        ...state,
        tags: action.payload,
        isLoading: false,
        error: null,
      };
    case TAG_ACTIONS.ADD_TAG:
      return {
        ...state,
        tags: [...state.tags, action.payload],
        isLoading: false,
        error: null,
      };
    case TAG_ACTIONS.UPDATE_TAG:
      return {
        ...state,
        tags: state.tags.map((tag) =>
          tag.id === action.payload.id ? action.payload : tag
        ),
        isLoading: false,
        error: null,
      };
    case TAG_ACTIONS.DELETE_TAG:
      return {
        ...state,
        tags: state.tags.filter((tag) => tag.id !== action.payload),
        selectedTags: state.selectedTags.filter(
          (tagId) => tagId !== action.payload
        ),
        isLoading: false,
        error: null,
      };
    case TAG_ACTIONS.SET_SELECTED_TAGS:
      return {
        ...state,
        selectedTags: action.payload,
      };
    case TAG_ACTIONS.ADD_SELECTED_TAG:
      return {
        ...state,
        selectedTags: state.selectedTags.includes(action.payload)
          ? state.selectedTags
          : [...state.selectedTags, action.payload],
      };
    case TAG_ACTIONS.REMOVE_SELECTED_TAG:
      return {
        ...state,
        selectedTags: state.selectedTags.filter(
          (tagId) => tagId !== action.payload
        ),
      };
    case TAG_ACTIONS.CLEAR_SELECTED_TAGS:
      return {
        ...state,
        selectedTags: [],
      };
    case TAG_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case TAG_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const TagContext = createContext();

// Provider component
export const TagProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tagReducer, initialState);

  const fetchTags = async () => {
    dispatch({ type: TAG_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch("/api/tags");

      if (response.ok) {
        const tags = await response.json();
        dispatch({ type: TAG_ACTIONS.SET_TAGS, payload: tags });
      } else {
        throw new Error("Failed to fetch tags");
      }
    } catch (error) {
      dispatch({ type: TAG_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const createTag = async (tagData) => {
    dispatch({ type: TAG_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      });

      if (response.ok) {
        const tag = await response.json();
        dispatch({ type: TAG_ACTIONS.ADD_TAG, payload: tag });
        return { success: true, tag };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create tag");
      }
    } catch (error) {
      dispatch({ type: TAG_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateTag = async (tagId, updates) => {
    dispatch({ type: TAG_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const tag = await response.json();
        dispatch({ type: TAG_ACTIONS.UPDATE_TAG, payload: tag });
        return { success: true, tag };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update tag");
      }
    } catch (error) {
      dispatch({ type: TAG_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const deleteTag = async (tagId) => {
    dispatch({ type: TAG_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        dispatch({ type: TAG_ACTIONS.DELETE_TAG, payload: tagId });
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete tag");
      }
    } catch (error) {
      dispatch({ type: TAG_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const searchTags = async (query) => {
    try {
      const response = await fetch(
        `/api/tags/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to search tags");
      }
    } catch (error) {
      dispatch({ type: TAG_ACTIONS.SET_ERROR, payload: error.message });
      return [];
    }
  };

  const setSelectedTags = (tagIds) => {
    dispatch({ type: TAG_ACTIONS.SET_SELECTED_TAGS, payload: tagIds });
  };

  const addSelectedTag = (tagId) => {
    dispatch({ type: TAG_ACTIONS.ADD_SELECTED_TAG, payload: tagId });
  };

  const removeSelectedTag = (tagId) => {
    dispatch({ type: TAG_ACTIONS.REMOVE_SELECTED_TAG, payload: tagId });
  };

  const clearSelectedTags = () => {
    dispatch({ type: TAG_ACTIONS.CLEAR_SELECTED_TAGS });
  };

  const clearError = () => {
    dispatch({ type: TAG_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    searchTags,
    setSelectedTags,
    addSelectedTag,
    removeSelectedTag,
    clearSelectedTags,
    clearError,
  };

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};

// Custom hook to use tag context
export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTags must be used within a TagProvider");
  }
  return context;
};
