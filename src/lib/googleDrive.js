import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

class GoogleDriveService {
  constructor() {
    // Initialize with OAuth credentials
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
  }

  // Method to set access token (called after OAuth flow)
  setAccessToken(accessToken) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });
  }

  async uploadFile(fileBuffer, fileName, mimeType, parentFolderId) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: parentFolderId
          ? [parentFolderId]
          : [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      const media = {
        mimeType,
        body: Readable.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id,webViewLink",
        supportsAllDrives: true,
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      console.error("Google Drive upload error:", error);
      throw new Error("Failed to upload file to Google Drive");
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId,
        supportsAllDrives: true,
      });
    } catch (error) {
      console.error("Google Drive delete error:", error);
      throw new Error("Failed to delete file from Google Drive");
    }
  }

  async getFileInfo(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: "id,name,size,mimeType,webViewLink,createdTime",
        supportsAllDrives: true,
      });
      return response.data;
    } catch (error) {
      console.error("Google Drive get file info error:", error);
      throw new Error("Failed to get file info from Google Drive");
    }
  }

  async createFolder(folderName, parentFolderId) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentFolderId
          ? [parentFolderId]
          : [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
        supportsAllDrives: true,
      });

      return response.data.id;
    } catch (error) {
      console.error("Google Drive create folder error:", error);
      throw new Error("Failed to create folder in Google Drive");
    }
  }

  async copyFile(sourceFileId, newFileName, parentFolderId) {
    try {
      const fileMetadata = {
        name: newFileName,
        parents: parentFolderId
          ? [parentFolderId]
          : [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      const response = await this.drive.files.copy({
        fileId: sourceFileId,
        requestBody: fileMetadata,
        fields: "id,webViewLink",
        supportsAllDrives: true,
      });

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
      };
    } catch (error) {
      console.error("Google Drive copy file error:", error);
      throw new Error("Failed to copy file in Google Drive");
    }
  }

  async listFiles(folderId, pageSize = 100) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: "files(id,name,mimeType,size,createdTime,webViewLink)",
        pageSize,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      return response.data.files;
    } catch (error) {
      console.error("Google Drive list files error:", error);
      throw new Error("Failed to list files from Google Drive");
    }
  }
}

export const googleDriveService = new GoogleDriveService();
