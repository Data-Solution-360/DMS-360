"use client";

import { AuthProvider } from "../store/AuthContext"; // Updated import path
import { StateProvider } from "./ContextProvider";
import { NotificationProvider } from "./NotificationContext";
import { UtilitiesProvider } from "./UtilitiesContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <StateProvider>
        <UtilitiesProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </UtilitiesProvider>
      </StateProvider>
    </AuthProvider>
  );
};

export default AppProviders;
