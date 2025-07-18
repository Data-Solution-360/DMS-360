"use client";

import React, {
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
      let errorMessage = "Login failed";

      // Handle Firebase Auth errors
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: actionTypes.LOGIN_ERROR,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
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

      let errorMessage = "Registration failed";

      // Handle Firebase Auth errors
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: actionTypes.REGISTER_ERROR,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await signOut(auth);
      dispatch({ type: actionTypes.LOGOUT });
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: actionTypes.LOGOUT });
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
