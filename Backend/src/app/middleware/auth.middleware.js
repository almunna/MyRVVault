const tokenService = require('../../utils/tokenService');
const { ApiError } = require('../../errors/errorHandler');
const asyncHandler = require('../../utils/asyncHandler');
const User = require('../module/User/User');
const Admin = require('../module/Admin/Admin');
/**
 * Authentication middleware to verify JWT access token
 */
const authenticateUser = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authorization token is required', 401);
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError('Invalid authorization format', 401);
    }
    // console.log(token);
    const decoded = tokenService.verifyAccessToken(token);
    // console.log(decoded);
    if (!decoded || decoded.role !== 'USER') {
      throw new ApiError('Invalid or unauthorized token', 401);
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError('User not found', 401);
    }
    if (user.isVerified === false) {
      throw new ApiError('Email not verified. Please verify your email to continue.', 403);
    }
    req.user = {
      id: user._id,
      email: user.email,
      role: decoded.role,
      selectedRvId: decoded.selectedRvId,
      ...(user.name && { name: user.name })
    };
    next();
  });

  const authenticateAdmin = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authorization token is required', 401);
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError('Invalid authorization format', 401);
    }
    // console.log(token);
    const decoded = tokenService.verifyAccessToken(token);
    // console.log(decoded);
    if (!decoded || decoded.role !== 'ADMIN') {
      throw new ApiError('Invalid or unauthorized token', 401);
    }
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      throw new ApiError('admin not found', 401);
    }
    if (admin.isVerified === false) {
      throw new ApiError('Email not verified. Please verify your email to continue.', 403);
    }
    req.admin = {
      id: admin._id,
      email: admin.email,
      role: decoded.role,
      ...(admin.name && { name: admin.name })
    };
    next();
  });

  

module.exports = {
    authenticateUser,
    authenticateAdmin
};
