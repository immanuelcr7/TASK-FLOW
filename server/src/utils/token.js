import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token
 * @param {string} userId
 * @returns {string}
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_development_secret_key_taskflow';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
  });
};

/**
 * Set HttpOnly cookie with JWT and return standardized JSON response
 * @param {import('express').Response} res
 * @param {object} user - User document
 * @param {number} statusCode
 * @param {string} message
 */
export const sendTokenResponse = (res, user, statusCode = 200, message = 'Success') => {
  const token = generateToken(user._id);

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token, // Also provided in payload for testing and API clients
    },
  });
};

/**
 * Clear the auth cookie on logout
 * @param {import('express').Response} res
 */
export const clearTokenResponse = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
