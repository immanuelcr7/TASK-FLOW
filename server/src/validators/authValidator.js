import validator from 'validator';

/**
 * Validate user registration request body
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (name.trim().length > 60) {
    errors.push({ field: 'name', message: 'Name cannot exceed 60 characters' });
  }

  if (!email || typeof email !== 'string' || !validator.isEmail(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors,
    });
  }

  // Normalize inputs
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate user login request body
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !validator.isEmail(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
      errors,
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate profile update (name)
 */
export const validateUpdateProfile = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (name.trim().length > 60) {
    errors.push({ field: 'name', message: 'Name cannot exceed 60 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid profile details.',
      errors,
    });
  }

  req.body.name = name.trim();
  next();
};

/**
 * Validate password change
 */
export const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters long' });
  }

  if (newPassword && currentPassword && newPassword === currentPassword) {
    errors.push({ field: 'newPassword', message: 'New password cannot be identical to current password' });
  }

  if (newPassword !== confirmNewPassword) {
    errors.push({ field: 'confirmNewPassword', message: 'New passwords do not match' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Password validation failed.',
      errors,
    });
  }

  next();
};
