import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  Download,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  Lock,
  Search,
  Settings,
  Settings2,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

// User name prefixes to filter out
export const userNamePrefix = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];

// Admin navigation links
export const linksAdmin = [
  {
    id: 1,
    title: "Dashboard",
    type: "single", // Single item, not collapsible
    link: "/dashboard",
    icon: <BarChart3 />,
    role: ["admin", "teacher", "student"],
  },
  {
    id: 2,
    title: "Users",
    type: "collapsible",
    icon: <Users />,
    links: [
      {
        name: "Add New User",
        link: "/dashboard/users/add",
        icon: <UserPlus />,
        role: ["admin"],
      },
      {
        name: "User List",
        link: "/dashboard/users/user-list",
        icon: <Users />,
        role: ["admin"],
      },

      {
        name: "Login History",
        link: "/dashboard/users/login-history",
        icon: <Shield />,
        role: ["admin"],
      },
    ],
  },
  {
    id: 3,
    title: "User Usage",
    type: "single",
    link: "/dashboard/user-usage",
    icon: <Activity />,
    role: ["admin"],
  },
  {
    id: 4,
    title: "Document Search",
    type: "collapsible",
    icon: <Search />,
    links: [
      {
        name: "Advanced Search",
        link: "/dashboard/documents/advance-search",
        icon: <Search />,
        role: ["admin", "teacher"],
      },
      {
        name: "Search History",
        link: "/dashboard/documents/search-history",
        icon: <Database />,
        role: ["admin"],
      },
      {
        name: "Saved Searches",
        link: "/dashboard/documents/saved-searches",
        icon: <BookOpen />,
        role: ["admin", "teacher"],
      },
    ],
  },
  {
    id: 5,
    title: "Main Contents",
    type: "single",
    link: "/dashboard/contents",
    icon: <FileText />,
    role: ["admin", "facilitator"],
  },
  {
    id: 6,
    title: "Folder List",
    type: "single",
    link: "/dashboard/folders",
    icon: <Folder />,
    role: ["admin", "teacher"],
  },
  {
    id: 7,
    title: "Download History",
    type: "single",
    link: "/dashboard/downloads",
    icon: <Download />,
    role: ["admin", "teacher", "student"],
  },
  {
    id: 8,
    title: "Company Setting",
    type: "collapsible",
    icon: <Settings2 />,
    links: [
      {
        name: "General Settings",
        link: "/dashboard/settings/general",
        icon: <Settings />,
        role: ["admin"],
      },
      {
        name: "Company Profile",
        link: "/dashboard/settings/profile",
        icon: <Eye />,
        role: ["admin"],
      },
      {
        name: "System Configuration",
        link: "/dashboard/settings/system",
        icon: <Database />,
        role: ["admin"],
      },
    ],
  },
  {
    id: 9,
    title: "Trash Box",
    type: "collapsible",
    icon: <Trash2 />,
    links: [
      {
        name: "Deleted Documents",
        link: "/dashboard/trash/documents",
        icon: <FileText />,
        role: ["admin"],
      },
      {
        name: "Deleted Folders",
        link: "/dashboard/trash/folders",
        icon: <FolderOpen />,
        role: ["admin"],
      },
      {
        name: "Deleted Users",
        link: "/dashboard/trash/users",
        icon: <Users />,
        role: ["admin"],
      },
    ],
  },
  {
    id: 10,
    title: "Permission",
    type: "collapsible",
    icon: <Lock />,
    links: [
      {
        name: "Role Management",
        link: "/dashboard/permissions/roles",
        icon: <Shield />,
        role: ["admin"],
      },
      {
        name: "Access Control",
        link: "/dashboard/permissions/access",
        icon: <Lock />,
        role: ["admin"],
      },
      {
        name: "Permission Groups",
        link: "/dashboard/permissions/groups",
        icon: <Users />,
        role: ["admin"],
      },
    ],
  },
];
