"use client";

import { useEffect } from "react";
import Modal from "react-modal";

export default function ModalProvider({ children }) {
  useEffect(() => {
    // Set the app element for react-modal
    Modal.setAppElement("#modal-root");
  }, []);

  return <>{children}</>;
}
