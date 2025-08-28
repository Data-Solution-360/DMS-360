"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const actionTypes = {
  AUTH_STATE_CHANGED: "AUTH_STATE_CHANGED",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_ERROR: "REGISTER_ERROR",
  SET_LOADING: "SET_LOADING",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case actionTypes.AUTH_STATE_CHANGED:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case actionTypes.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case actionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case actionTypes.REGISTER_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Auth Context
const AuthContext = createContext();

// Auth Provider
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [initialLoad, setInitialLoad] = useState(true);

  // Token refresh helper
  const refreshToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const freshToken = await user.getIdToken(true);

      // Update server with fresh token
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken: freshToken }),
        credentials: "include",
      });

      if (response.ok) {
        return freshToken;
      }
    } catch (error) {
      console.error("[Auth] Token refresh failed:", error);
    }
    return null;
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Refresh token every 50 minutes (before 1 hour expiry)
    const refreshInterval = setInterval(async () => {
      await refreshToken();
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [state.user, refreshToken]);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from our API
          const response = await fetch("/api/auth/me", {
            credentials: "include",
          });
          const data = await response.json();

          if (data.success) {
            dispatch({
              type: actionTypes.AUTH_STATE_CHANGED,
              payload: { user: data.user },
            });

            // Initialize browser session tracking if session ID is available
            if (data.sessionId) {
              initializeBrowserSession(data.sessionId);
            }
          } else {
            // If API call fails, try to refresh token
            const freshToken = await refreshToken();
            if (freshToken) {
              // Retry getting user data
              const retryResponse = await fetch("/api/auth/me", {
                credentials: "include",
              });
              const retryData = await retryResponse.json();

              if (retryData.success) {
                dispatch({
                  type: actionTypes.AUTH_STATE_CHANGED,
                  payload: { user: retryData.user },
                });

                // Initialize browser session tracking
                if (retryData.sessionId) {
                  initializeBrowserSession(retryData.sessionId);
                }
              } else {
                dispatch({ type: actionTypes.LOGOUT });
              }
            } else {
              dispatch({ type: actionTypes.LOGOUT });
            }
          }
        } catch (error) {
          console.error("Auth state error:", error);
          dispatch({ type: actionTypes.LOGOUT });
        }
      } else {
        dispatch({ type: actionTypes.LOGOUT });
      }
      setInitialLoad(false);
    });

    return () => unsubscribe();
  }, [refreshToken]);

  // Memoize callback functions to prevent recreation
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      // First, authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get the ID token
      const idToken = await user.getIdToken();

      // Send the ID token to our API for verification and to get user data
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { user: data.user },
        });
        return { success: true, user: data.user };
      } else {
        dispatch({
          type: actionTypes.LOGIN_ERROR,
          payload: { error: data.error },
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Login error:", error);

      // Custom error handling - no Firebase error codes
      let errorMessage = "Invalid email or password. Please try again.";
      let errorCode = "LOGIN_FAILED";

      // Analyze error patterns and provide custom messages
      if (error.message) {
        const errorLower = error.message.toLowerCase();

        if (errorLower.includes("network") || errorLower.includes("fetch")) {
          errorMessage =
            "Network connection issue detected. Please check your internet connection and try again.";
          errorCode = "NETWORK_ERROR";
        } else if (
          errorLower.includes("timeout") ||
          errorLower.includes("timed out")
        ) {
          errorMessage =
            "The login request timed out. Please try again or contact support if the issue persists.";
          errorCode = "TIMEOUT_ERROR";
        } else if (
          errorLower.includes("quota") ||
          errorLower.includes("limit")
        ) {
          errorMessage =
            "System resources are currently limited. Please try again later or contact support.";
          errorCode = "RESOURCE_LIMIT";
        } else if (
          errorLower.includes("permission") ||
          errorLower.includes("unauthorized")
        ) {
          errorMessage =
            "Access denied. You don't have permission to perform this action.";
          errorCode = "PERMISSION_DENIED";
        } else if (
          errorLower.includes("invalid") &&
          errorLower.includes("email")
        ) {
          errorMessage =
            "The email address format is invalid. Please enter a valid email address.";
          errorCode = "INVALID_EMAIL_FORMAT";
        } else if (
          errorLower.includes("user") &&
          errorLower.includes("found")
        ) {
          errorMessage =
            "No account found with this email address. Please check your email or create a new account.";
          errorCode = "ACCOUNT_NOT_FOUND";
        } else if (
          errorLower.includes("password") ||
          errorLower.includes("wrong")
        ) {
          errorMessage =
            "The password you entered is incorrect. Please check your password and try again.";
          errorCode = "INCORRECT_PASSWORD";
        } else if (
          errorLower.includes("too many") ||
          errorLower.includes("requests")
        ) {
          errorMessage =
            "Too many failed login attempts detected. Please wait a few minutes before trying again or reset your password.";
          errorCode = "TOO_MANY_ATTEMPTS";
        } else if (
          errorLower.includes("disabled") ||
          errorLower.includes("suspended")
        ) {
          errorMessage =
            "This account has been temporarily disabled. Please contact support for assistance.";
          errorCode = "ACCOUNT_DISABLED";
        } else if (
          errorLower.includes("email") &&
          errorLower.includes("verified")
        ) {
          errorMessage =
            "Please verify your email address before logging in. Check your inbox for a verification link.";
          errorCode = "EMAIL_NOT_VERIFIED";
        } else if (
          errorLower.includes("maintenance") ||
          errorLower.includes("unavailable")
        ) {
          errorMessage =
            "The system is currently under maintenance. Please try again later or contact support.";
          errorCode = "SYSTEM_MAINTENANCE";
        }
      }

      dispatch({
        type: actionTypes.LOGIN_ERROR,
        payload: {
          error: errorMessage,
          code: errorCode,
          timestamp: new Date().toISOString(),
        },
      });
      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      };
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      // First, create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update the user's display name in Firebase
      if (name) {
        await updateProfile(firebaseUser, {
          displayName: name,
        });
      }

      // Now register the user in our database with the Firebase UID
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          firebaseUid: firebaseUser.uid,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: actionTypes.REGISTER_SUCCESS,
          payload: { user: data.user },
        });
        return { success: true, user: data.user };
      } else {
        // If registration API fails, delete the Firebase user to keep things consistent
        try {
          await firebaseUser.delete();
        } catch (deleteError) {
          console.error(
            "Failed to delete Firebase user after registration failure:",
            deleteError
          );
        }

        dispatch({
          type: actionTypes.REGISTER_ERROR,
          payload: { error: data.error },
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage =
        "An unexpected error occurred during registration. Please try again.";
      let errorCode = "REGISTRATION_FAILED";

      // Custom error handling - no Firebase error codes
      if (error.message) {
        const errorLower = error.message.toLowerCase();

        if (errorLower.includes("network") || errorLower.includes("fetch")) {
          errorMessage =
            "Network connection issue detected. Please check your internet connection and try again.";
          errorCode = "NETWORK_ERROR";
        } else if (
          errorLower.includes("timeout") ||
          errorLower.includes("timed out")
        ) {
          errorMessage =
            "The registration request timed out. Please try again or contact support if the issue persists.";
          errorCode = "TIMEOUT_ERROR";
        } else if (
          errorLower.includes("quota") ||
          errorLower.includes("limit")
        ) {
          errorMessage =
            "System resources are currently limited. Please try again later or contact support.";
          errorCode = "RESOURCE_LIMIT";
        } else if (
          errorLower.includes("email") &&
          errorLower.includes("already")
        ) {
          errorMessage =
            "An account with this email address already exists. Please use a different email or try logging in instead.";
          errorCode = "EMAIL_ALREADY_EXISTS";
        } else if (
          errorLower.includes("weak") ||
          errorLower.includes("password")
        ) {
          errorMessage =
            "The password you entered is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.";
          errorCode = "WEAK_PASSWORD";
        } else if (
          errorLower.includes("invalid") &&
          errorLower.includes("email")
        ) {
          errorMessage =
            "The email address format is invalid. Please enter a valid email address.";
          errorCode = "INVALID_EMAIL_FORMAT";
        } else if (
          errorLower.includes("name") &&
          errorLower.includes("required")
        ) {
          errorMessage =
            "Please provide your full name to complete the registration.";
          errorCode = "NAME_REQUIRED";
        } else if (
          errorLower.includes("maintenance") ||
          errorLower.includes("unavailable")
        ) {
          errorMessage =
            "The system is currently under maintenance. Please try again later or contact support.";
          errorCode = "SYSTEM_MAINTENANCE";
        }
      }

      dispatch({
        type: actionTypes.REGISTER_ERROR,
        payload: {
          error: errorMessage,
          code: errorCode,
          timestamp: new Date().toISOString(),
        },
      });
      return {
        success: false,
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      };
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Sign out from Firebase
      await signOut(auth);

      // Update auth state
      dispatch({ type: actionTypes.LOGOUT });

      // Redirect to home page after logout
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: actionTypes.LOGOUT });

      // Even if logout fails, redirect to home
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return { success: false, error: "Logout failed" };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  // Add updateUserProfile function
  const updateUserProfile = useCallback(async (displayName) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user");
      }

      await updateProfile(user, {
        displayName,
      });

      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      clearError,
      updateUserProfile,
      initialLoad,
      refreshToken, // Expose refresh function
    }),
    [
      state,
      login,
      register,
      logout,
      clearError,
      updateUserProfile,
      initialLoad,
      refreshToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
