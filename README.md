# DMS-360 - Document Management System

A comprehensive document management system built with Next.js 15, MongoDB, and Google Drive integration. Features dynamic folder structures, secure file uploads, role-based access control, and advanced search capabilities.

## 🚀 Features

- **Dynamic Folder Structure**: Create unlimited nested folders (curriculum → course → module → class → docs)
- **Secure File Storage**: Files stored on Google Drive with metadata in MongoDB
- **Role-Based Access Control**: Admin, Facilitator, and Employee roles
- **Advanced Search**: Full-text search with tags and filters
- **Drag & Drop Upload**: Modern file upload interface with progress tracking
- **File Management**: View, download, and delete documents
- **Responsive Design**: Modern UI built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Google Drive API
- **Authentication**: JWT with HTTP-only cookies
- **File Upload**: Formidable, React Dropzone
- **Icons**: React Icons (Feather Icons)
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Google Cloud Platform account with Drive API enabled
- Google Service Account with Drive API permissions

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd database-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dms-360

# Google Drive API Configuration
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,txt,jpg,jpeg,png,gif,mp4,avi,mov
```

### 4. Google Drive Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create a Service Account
5. Download the JSON key file
6. Share your Google Drive folder with the service account email
7. Update the environment variables with the service account details

### 5. Database Setup

Start MongoDB (if using local instance):

```bash
# macOS with Homebrew
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 6. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Visit `http://localhost:3000` to access the application.

## 📁 Project Structure

```
database-management-system/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── documents/     # Document management
│   │   └── folders/       # Folder management
│   ├── dashboard/         # Main dashboard page
│   ├── login/             # Login page
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # React components
│   ├── DocumentList.js    # Document display component
│   ├── FolderTree.js      # Folder tree component
│   ├── SearchBar.js       # Search functionality
│   └── UploadModal.js     # File upload modal
├── lib/                   # Utility libraries
│   ├── auth.js           # Authentication utilities
│   ├── database.js       # MongoDB connection
│   └── googleDrive.js    # Google Drive integration
├── models/               # Mongoose models
│   ├── Document.js       # Document schema
│   ├── Folder.js         # Folder schema
│   └── User.js           # User schema
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # Project documentation
```

## 🔐 Authentication & Authorization

The system uses JWT tokens stored in HTTP-only cookies for security. Three user roles are supported:

- **Admin**: Full access to all features
- **Facilitator**: Can manage documents and folders
- **Employee**: Can view and upload documents

## 📤 File Upload Process

1. User selects files via drag & drop or file picker
2. Files are validated for type and size
3. Files are uploaded to Google Drive via service account
4. Document metadata is stored in MongoDB
5. User receives confirmation and can view/download files

## 🔍 Search & Filtering

- Full-text search across document names and content
- Filter by file type, upload date, and tags
- Sort by name, date, or size
- Pagination for large document collections

## 🎨 UI Components

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Loading States**: Smooth loading indicators and transitions
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant components

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Node.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- ESLint configuration included
- Prettier formatting
- Consistent component structure
- Type-safe JavaScript practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔄 Updates

Stay updated with the latest features and security patches by regularly pulling from the main branch.

---

**DMS-360** - Simplifying document management for modern organizations.
# DMS-360
