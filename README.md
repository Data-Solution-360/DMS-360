# DMS-360: Document Management System

A modern, cloud-based document management system built with Next.js, Firebase, and Tailwind CSS.

## 🚀 Features

- **Cloud Storage**: Firebase Storage for secure file storage
- **Real-time Database**: Firestore for document metadata and user management
- **User Authentication**: JWT-based authentication with role-based access control
- **Document Management**: Upload, organize, and manage documents with versioning
- **Folder Structure**: Hierarchical folder organization with permissions
- **Tagging System**: Flexible tagging and categorization
- **Search & Filter**: Advanced search and filtering capabilities
- **Responsive Design**: Modern, mobile-friendly UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend

- **Next.js 15**: Full-stack React framework
- **Firebase**:
  - Firestore (NoSQL database)
  - Firebase Storage (file storage)
  - Firebase Authentication (optional)
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing

### Frontend

- **React 18**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **React Context**: State management
- **React Hooks**: Functional components and state

### Development

- **TypeScript**: Type safety (optional)
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── documents/     # Document management
│   │   ├── folders/       # Folder management
│   │   └── tags/          # Tag management
│   ├── dashboard/         # Main dashboard
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── features/          # Feature-specific components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── firebase.js        # Firebase configuration
│   ├── firestore.js       # Firestore services
│   ├── firebaseUpload.js  # Firebase Storage service
│   └── auth.js            # Authentication utilities
├── store/                 # React Context providers
└── types/                 # TypeScript type definitions
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd database-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Firebase Storage
4. Configure security rules for both services
5. Add your Firebase configuration to the environment variables

### 5. Firestore Security Rules

```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Documents collection
    match /documents/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Folders collection
    match /folders/{folderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Tags collection
    match /tags/{tagId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Firebase Storage Rules

```javascript
// Storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 7. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 🔐 Authentication

The system uses JWT-based authentication with the following features:

- **User Registration**: Email/password registration
- **User Login**: Email/password authentication
- **Role-based Access**: Admin, Facilitator, Employee roles
- **Document Access Control**: Granular permissions per folder
- **Session Management**: HTTP-only cookies for security

## 📄 Document Management

### Features

- **File Upload**: Support for various file types
- **Version Control**: Document versioning with history
- **Metadata Management**: Tags, descriptions, and categorization
- **Search & Filter**: Full-text search and advanced filtering
- **Access Control**: Folder-based permissions

### Supported File Types

- Documents: PDF, DOC, DOCX, TXT
- Spreadsheets: XLS, XLSX, CSV
- Presentations: PPT, PPTX
- Images: JPG, PNG, GIF, SVG
- Archives: ZIP, RAR, 7Z
- Audio/Video: MP3, MP4, AVI, MOV

## 📁 Folder Management

### Features

- **Hierarchical Structure**: Nested folder organization
- **Permission System**: User and role-based access control
- **Breadcrumb Navigation**: Easy folder navigation
- **Bulk Operations**: Multi-select and bulk actions

## 🏷️ Tagging System

### Features

- **Flexible Tagging**: Add multiple tags to documents
- **Tag Categories**: Organize tags by categories
- **Search by Tags**: Filter documents by tags
- **Tag Management**: Create, edit, and delete tags

## 🔍 Search & Filtering

### Search Capabilities

- **Full-text Search**: Search document names, content, and tags
- **Advanced Filters**: Filter by date, size, type, and tags
- **Saved Searches**: Save and reuse search queries
- **Search History**: Track recent searches

## 👥 User Management

### User Roles

- **Admin**: Full system access and user management
- **Facilitator**: Document management and user oversight
- **Employee**: Basic document access and upload

### Features

- **User Registration**: Self-registration with admin approval
- **Role Management**: Admin can assign and change user roles
- **Access Control**: Granular permissions per folder
- **User Profiles**: Manage user information and preferences

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run setup        # Initial setup
```

### Code Style

- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript for type safety (optional)

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

- Create an issue in the GitHub repository
- Check the documentation
- Review the code examples

## 🔄 Migration from MongoDB

This project has been migrated from MongoDB/Mongoose to Firebase Firestore. Key changes:

- **Database**: MongoDB → Firestore
- **File Storage**: Google Drive → Firebase Storage
- **Authentication**: Enhanced JWT with Firestore user verification
- **Models**: Mongoose schemas → Firestore collections
- **API Routes**: Updated to use Firestore services
- **Frontend**: Updated to work with Firestore document structure

### Migration Benefits

- **Real-time Updates**: Firestore provides real-time data synchronization
- **Scalability**: Automatic scaling with Firebase
- **Security**: Built-in security rules and authentication
- **Cost-effective**: Pay-as-you-go pricing model
- **Integration**: Seamless integration with other Firebase services
