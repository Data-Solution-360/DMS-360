"use client";

import React, { useState } from "react";
import VersionHistoryModal from "./components/VersionHistoryModal";
import VersionUploadModal from "./components/VersionUploadModal";
import { useVersionActions } from "./hooks/useVersionActions";

export default function VersionManager({
  document,
  userId,
  onVersionChange,
  children,
}) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { uploadVersion, restoreVersion, loading } = useVersionActions({
    document,
    userId,
    onSuccess: handleVersionChange,
  });

  function handleVersionChange() {
    setRefreshTrigger((prev) => prev + 1);
    if (onVersionChange) {
      onVersionChange();
    }
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    handleVersionChange();
  };

  const handleRestoreSuccess = () => {
    setShowHistoryModal(false);
    handleVersionChange();
  };

  // Clone children and pass version management props
  const childrenWithProps = children
    ? React.cloneElement(children, {
        onShowHistory: () => setShowHistoryModal(true),
        onShowUpload: () => setShowUploadModal(true),
        document,
        loading,
      })
    : null;

  return (
    <>
      {childrenWithProps}

      {/* Version History Modal */}
      {showHistoryModal && (
        <VersionHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          document={document}
          onRestore={handleRestoreSuccess}
          refreshTrigger={refreshTrigger}
        />
      )}

      {/* Version Upload Modal */}
      {showUploadModal && (
        <VersionUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          document={document}
          userId={userId}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}
