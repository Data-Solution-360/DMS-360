import { useApi } from "./useApi";
import { useAuth } from "../store/AuthContext";
import { parseUserAgent } from "../lib/utils/browserUtils.js";

export const useDownloadTracking = () => {
  const { apiCall } = useApi();
  const { user } = useAuth();

  const trackDownload = async (document, success = true, errorMessage = null) => {
    try {
      console.log("🔍 Tracking download for document:", document);
      
      // Get browser and IP information
      const browserInfo = parseUserAgent(navigator.userAgent);
      
      // Get IP address (you might need to implement this based on your setup)
      let ipAddress = "Unknown";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (error) {
        console.log("Could not fetch IP address, using localhost");
        ipAddress = "127.0.0.1";
      }

      const downloadData = {
        userId: user?.id,
        documentId: document.id,
        documentName: document.originalName || document.name,
        documentSize: document.size,
        mimeType: document.mimeType,
        ipAddress,
        userAgent: navigator.userAgent,
        browserInfo,
        success,
        errorMessage,
      };

      console.log("🔍 Sending download data:", downloadData);

      const response = await apiCall("/api/downloads/track", {
        method: "POST",
        body: JSON.stringify(downloadData),
      });

      console.log("🔍 Download tracking response:", response);

      if (response.success) {
        console.log("✅ Download tracked successfully");
      } else {
        console.error("❌ Failed to track download:", response.error);
      }
    } catch (error) {
      console.error("❌ Error tracking download:", error);
      // Don't throw error to avoid breaking the download functionality
    }
  };

  const handleDownload = async (document) => {
    console.log("🔍 Starting download for:", document);
    
    try {
      if (typeof window !== "undefined" && document?.firebaseStorageUrl) {
        const link = window.document.createElement("a");
        link.href = document.firebaseStorageUrl;
        link.download = document.originalName || document.name;
        link.target = "_blank";
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        console.log("✅ Download initiated successfully");
        
        // Track successful download
        await trackDownload(document, true);
      } else {
        throw new Error("Download URL not available");
      }
    } catch (error) {
      console.error("❌ Download error:", error);
      
      // Track failed download
      await trackDownload(document, false, error.message);
      
      // Fallback: open in new tab
      if (document?.firebaseStorageUrl) {
        window.open(document.firebaseStorageUrl, "_blank");
      }
    }
  };

  return { handleDownload, trackDownload };
};
