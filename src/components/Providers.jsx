"use client";

import { AppProvider } from "../store";

export default function Providers({ children }) {
  return <AppProvider>{children}</AppProvider>;
}
