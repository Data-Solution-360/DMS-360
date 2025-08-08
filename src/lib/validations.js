// Validation schemas for form inputs

// User registration validation
export function validateRegistration(data) {
  const errors = {};

  // Email validation
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password =
      "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Name validation
  if (!data.name) {
    errors.name = "Name is required";
  } else if (data.name.length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// User login validation
export function validateLogin(data) {
  const errors = {};

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Folder creation validation
export function validateFolder(data) {
  const errors = {};

  if (!data.name) {
    errors.name = "Folder name is required";
  } else if (data.name.length < 1) {
    errors.name = "Folder name must be at least 1 character long";
  } else if (data.name.length > 100) {
    errors.name = "Folder name must be less than 100 characters";
  }

  if (data.description && data.description.length > 500) {
    errors.description = "Description must be less than 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Tag creation validation
export function validateTag(data) {
  const errors = {};

  if (!data.name) {
    errors.name = "Tag name is required";
  } else if (data.name.length < 1) {
    errors.name = "Tag name must be at least 1 character long";
  } else if (data.name.length > 50) {
    errors.name = "Tag name must be less than 50 characters";
  } else if (!/^[a-zA-Z0-9\s-_]+$/.test(data.name)) {
    errors.name =
      "Tag name can only contain letters, numbers, spaces, hyphens, and underscores";
  }

  if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
    errors.color = "Please enter a valid hex color code";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Document upload validation
export function validateDocumentUpload(file) {
  const errors = {};

  if (!file) {
    errors.file = "Please select a file to upload";
    return { isValid: false, errors };
  }

  // File size validation (50MB limit)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.file = "File size must be less than 50MB";
  }

  // File type validation
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/avi",
    "video/mov",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.file =
      "File type not supported. Please upload a supported file type.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Search validation
export function validateSearch(query) {
  const errors = {};

  if (query && query.length > 200) {
    errors.query = "Search query must be less than 200 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// User profile validation
export function validateUserProfile(data) {
  const errors = {};

  if (!data.name) {
    errors.name = "Name is required";
  } else if (data.name.length < 2) {
    errors.name = "Name must be at least 2 characters long";
  } else if (data.name.length > 100) {
    errors.name = "Name must be less than 100 characters";
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (
    data.phone &&
    !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/\s/g, ""))
  ) {
    errors.phone = "Please enter a valid phone number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Password change validation
export function validatePasswordChange(data) {
  const errors = {};

  if (!data.currentPassword) {
    errors.currentPassword = "Current password is required";
  }

  if (!data.newPassword) {
    errors.newPassword = "New password is required";
  } else if (data.newPassword.length < 8) {
    errors.newPassword = "New password must be at least 8 characters long";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
    errors.newPassword =
      "New password must contain at least one uppercase letter, one lowercase letter, and one number";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password";
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Alias for backward compatibility
export function validateRegister(data) {
  return validateRegistration(data);
}
