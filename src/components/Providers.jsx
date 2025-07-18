"use client";

import { useEffect } from "react";
import Modal from "react-modal";
import { AppProvider } from "../store";

export default function Providers({ children }) {
  useEffect(() => {
    // Set the app element for react-modal accessibility
    Modal.setAppElement("body");
  }, []);

  return <AppProvider>{children}</AppProvider>;
}
