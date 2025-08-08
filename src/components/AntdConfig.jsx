"use client";

import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";

// Configure Antd render for React 19
unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});

// This component doesn't render anything, it just configures Antd
export default function AntdConfig() {
  return null;
}
