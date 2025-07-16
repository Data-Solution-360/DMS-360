"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication status after mount
  useEffect(() => {
    if (mounted) {
      checkAuthStatus();
    }
  }, [mounted]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const user = await response.json();
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const login = async (credentials) => {
    console.log("AuthContext: Login started with credentials:", credentials);
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      console.log("AuthContext: Making API call to /api/auth/login");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log("AuthContext: API response status:", response.status);
      const data = await response.json();
      console.log("AuthContext: API response data:", data);

      if (response.ok) {
        console.log("AuthContext: Login successful, dispatching LOGIN_SUCCESS");
        // The API returns { success: true, data: { user: {...}, token: "..." } }
        const userData = data.data ? data.data.user : data.user;
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
        return { success: true };
      } else {
        console.log("AuthContext: Login failed, dispatching LOGIN_FAILURE");
        const errorMessage = data.error || data.message || "Login failed";
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: "Login failed" });
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data.user });
        return { success: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: data.message });
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: "Registration failed",
      });
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
