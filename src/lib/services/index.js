// Export all services with explicit imports first
import { COLLECTIONS } from "./constants.js";
import { DepartmentService } from "./DepartmentService.js";
import { DocumentService } from "./DocumentService.js";
import { DownloadService } from "./DownloadService.js";
import { FolderService } from "./FolderService.js";
import { LoginHistoryService } from "./LoginHistoryService.js";
import { SearchService } from "./SearchService.js";
import { TagService } from "./TagService.js";
import { UserService } from "./UserService.js";

// Then export them
export {
  COLLECTIONS,
  DepartmentService,
  DocumentService,
  DownloadService,
  FolderService,
  LoginHistoryService,
  SearchService,
  TagService,
  UserService,
};

// Legacy export for backward compatibility
export const firestoreServices = {
  users: UserService,
  documents: DocumentService,
  folders: FolderService,
  tags: TagService,
  departments: DepartmentService,
  loginHistory: LoginHistoryService,
  search: SearchService,
  downloads: DownloadService,
};
