"use client";

import { useCallback, useState } from "react";

export function useLocalStorage(key, initialValue) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Hook for managing user preferences
export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage(
    "user_preferences",
    {
      theme: "light",
      language: "en",
      pageSize: 20,
      showSidebar: true,
      sortBy: "name",
      sortOrder: "asc",
    }
  );

  const updatePreference = useCallback(
    (key, value) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setPreferences]
  );

  const resetPreferences = useCallback(() => {
    removePreferences();
  }, [removePreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}

// Hook for managing recent items
export function useRecentItems(key, maxItems = 10) {
  const [recentItems, setRecentItems, removeRecentItems] = useLocalStorage(
    key,
    []
  );

  const addItem = useCallback(
    (item) => {
      setRecentItems((prev) => {
        // Remove if already exists
        const filtered = prev.filter(
          (existingItem) => existingItem.id !== item.id
        );

        // Add to beginning and limit to maxItems
        return [item, ...filtered].slice(0, maxItems);
      });
    },
    [setRecentItems, maxItems]
  );

  const removeItem = useCallback(
    (itemId) => {
      setRecentItems((prev) => prev.filter((item) => item.id !== itemId));
    },
    [setRecentItems]
  );

  const clearItems = useCallback(() => {
    removeRecentItems();
  }, [removeRecentItems]);

  return {
    recentItems,
    addItem,
    removeItem,
    clearItems,
  };
}

// Hook for managing search history
export function useSearchHistory(maxItems = 20) {
  const [searchHistory, setSearchHistory, removeSearchHistory] =
    useLocalStorage("search_history", []);

  const addSearch = useCallback(
    (query) => {
      if (!query.trim()) return;

      setSearchHistory((prev) => {
        // Remove if already exists
        const filtered = prev.filter((item) => item !== query);

        // Add to beginning and limit to maxItems
        return [query, ...filtered].slice(0, maxItems);
      });
    },
    [setSearchHistory, maxItems]
  );

  const removeSearch = useCallback(
    (query) => {
      setSearchHistory((prev) => prev.filter((item) => item !== query));
    },
    [setSearchHistory]
  );

  const clearHistory = useCallback(() => {
    removeSearchHistory();
  }, [removeSearchHistory]);

  return {
    searchHistory,
    addSearch,
    removeSearch,
    clearHistory,
  };
}

// Hook for managing form data persistence
export function useFormPersistence(formKey, initialData = {}) {
  const [formData, setFormData, removeFormData] = useLocalStorage(
    `form_${formKey}`,
    initialData
  );

  const updateField = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setFormData]
  );

  const updateFields = useCallback(
    (fields) => {
      setFormData((prev) => ({
        ...prev,
        ...fields,
      }));
    },
    [setFormData]
  );

  const resetForm = useCallback(() => {
    removeFormData();
  }, [removeFormData]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
  };
}
