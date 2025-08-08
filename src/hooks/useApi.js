"use client";

import { useCallback, useState } from "react";
import { auth } from "../lib/firebase";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get fresh ID token with fallback
  const getFreshIdToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Authentication required");
    }

    try {
      // Try to get a fresh token
      return await user.getIdToken(true);
    } catch (error) {
      console.warn("Failed to refresh token:", error);

      // If quota exceeded or other Firebase errors, try to get the current token
      try {
        return await user.getIdToken(false); // Don't force refresh
      } catch (fallbackError) {
        console.error("Failed to get token:", fallbackError);
        throw new Error("Authentication required");
      }
    }
  }, []);

  // Helper function to make API call with automatic token refresh
  const makeApiCall = useCallback(
    async (url, options = {}, retryCount = 0) => {
      const maxRetries = 1; // Only retry once for token refresh

      try {
        // Get the current user's ID token
        const idToken = await getFreshIdToken();

        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${idToken}`,
            "Content-Type":
              options.headers?.["Content-Type"] || "application/json",
          },
          credentials: "include",
        });

        // Add better error handling for JSON parsing
        let data;
        try {
          const responseText = await response.text();
          if (!responseText) {
            throw new Error("Empty response from server");
          }
          data = JSON.parse(responseText);
        } catch (jsonError) {
          if (jsonError instanceof SyntaxError) {
            console.error("Invalid JSON response:", responseText);
            throw new Error("Invalid response format from server");
          }
          throw jsonError;
        }

        // Check for token expiration error
        if (!response.ok) {
          if (
            response.status === 401 &&
            (data.error?.includes("expired") ||
              data.error?.includes("invalid")) &&
            retryCount < maxRetries
          ) {
            try {
              // Get fresh token and update cookie
              const freshToken = await getFreshIdToken();

              // Update the server with fresh token
              await fetch("/api/auth/refresh", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${freshToken}`,
                },
                body: JSON.stringify({ idToken: freshToken }),
                credentials: "include",
              });

              // Retry the original request
              return await makeApiCall(url, options, retryCount + 1);
            } catch (refreshError) {
              console.error("[API] Token refresh failed:", refreshError);
              // Don't redirect automatically, let the component handle it
              throw new Error("Authentication failed. Please login again.");
            }
          }

          throw new Error(
            data.message ||
              data.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        return data;
      } catch (err) {
        if (err.message?.includes("Authentication required")) {
          // Don't redirect automatically, let the component handle it
          throw new Error("Authentication required. Please login.");
        }
        if (err.message?.includes("fetch")) {
          throw new Error("Network error. Please check your connection.");
        }
        throw err;
      }
    },
    [getFreshIdToken]
  );

  const apiCall = useCallback(
    async (url, options = {}, onProgress) => {
      setLoading(true);
      setError(null);

      try {
        // Handle file uploads with progress tracking
        if (options.body instanceof FormData) {
          return new Promise(async (resolve, reject) => {
            try {
              // Get the current user's ID token
              const idToken = await getFreshIdToken();

              const xhr = new XMLHttpRequest();

              xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable && onProgress) {
                  const progress = Math.round(
                    (event.loaded / event.total) * 100
                  );
                  onProgress(progress);
                }
              });

              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                  } catch (e) {
                    reject(new Error("Invalid JSON response"));
                  }
                } else {
                  // Handle token expiration for file uploads
                  if (xhr.status === 401) {
                    reject(
                      new Error(
                        "Authentication expired. Please refresh the page."
                      )
                    );
                  } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                  }
                }
              });

              xhr.addEventListener("error", () => {
                reject(new Error("Network error during upload"));
              });

              xhr.open(options.method || "POST", url);
              xhr.withCredentials = true;

              // Set authorization header
              xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);

              xhr.send(options.body);
            } catch (error) {
              reject(error);
            }
          });
        }

        // Handle regular API calls with automatic token refresh
        return await makeApiCall(url, options);
      } catch (err) {
        const errorMessage = err.message || "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [makeApiCall, getFreshIdToken]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    apiCall,
    clearError,
  };
}

// Specialized hooks for common operations
export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const uploadFile = useCallback(async (url, formData, onProgress) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const xhr = new XMLHttpRequest();

      return new Promise(async (resolve, reject) => {
        try {
          // Get the current user's ID token with fallback
          const user = auth.currentUser;
          if (!user) {
            throw new Error("Authentication required");
          }

          let idToken;
          try {
            idToken = await user.getIdToken(true); // Try to refresh
          } catch (error) {
            console.warn(
              "Failed to refresh token, using current token:",
              error
            );
            idToken = await user.getIdToken(false); // Use current token
          }

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
              if (onProgress) onProgress(progress);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (error) {
                reject(new Error("Invalid JSON response"));
              }
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("POST", url);
          xhr.withCredentials = true;

          // Set authorization header
          xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);

          xhr.send(formData);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      setUploadError(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadError,
    uploadFile,
    clearUploadError,
  };
}

export function useSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const search = useCallback(async (url, query, options = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const searchUrl = new URL(url, window.location.origin);
      searchUrl.searchParams.set("q", query);

      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          searchUrl.searchParams.set(key, value);
        });
      }

      const response = await fetch(searchUrl.toString(), {
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
      return data;
    } catch (error) {
      setSearchError(error.message);
      setSearchResults([]);
      throw error;
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    searching,
    searchError,
    search,
    clearSearch,
  };
}

export function usePagination() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const updatePagination = useCallback(
    (newPage, newPageSize, newTotalItems) => {
      setPage(newPage);
      setPageSize(newPageSize);
      setTotalItems(newTotalItems);
      setTotalPages(Math.ceil(newTotalItems / newPageSize));
    },
    []
  );

  const goToPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const resetPagination = useCallback(() => {
    setPage(1);
    setTotalItems(0);
    setTotalPages(0);
  }, []);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    updatePagination,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
    setPageSize,
  };
}
