import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendTokenResponse, clearTokenResponse } from '../utils/token.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in DB
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    // Send JWT via HttpOnly cookie & response
    return sendTokenResponse(res, user, 201, 'User account registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & return JWT token via HttpOnly cookie
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by normalized email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Send JWT via HttpOnly cookie & response
    return sendTokenResponse(res, user, 200, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user & clear authentication cookie
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
export const logout = async (req, res) => {
  return clearTokenResponse(res);
};

/**
 * @desc    Get current authenticated user info
 * @route   GET /api/v1/auth/me
 * @access  Private (requires protect middleware)
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    },
  });
};
