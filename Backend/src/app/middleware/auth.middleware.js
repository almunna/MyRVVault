const tokenService = require('../../utils/tokenService');
const { ApiError } = require('../../errors/errorHandler');
const asyncHandler = require('../../utils/asyncHandler');
const { db } = require('../../config/db');

const authenticateUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('Authorization token is required', 401);
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new ApiError('Invalid authorization format', 401);
  }
  const decoded = tokenService.verifyAccessToken(token);
  if (!decoded || decoded.role !== 'USER') {
    throw new ApiError('Invalid or unauthorized token', 401);
  }
  const userDoc = await db.collection('users').doc(decoded.id).get();
  if (!userDoc.exists) {
    throw new ApiError('User not found', 401);
  }
  const user = { id: userDoc.id, ...userDoc.data() };
  if (user.isVerified === false) {
    throw new ApiError('Email not verified. Please verify your email to continue.', 403);
  }
  req.user = {
    id: user.id,
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
  const decoded = tokenService.verifyAccessToken(token);
  if (!decoded || decoded.role !== 'ADMIN') {
    throw new ApiError('Invalid or unauthorized token', 401);
  }
  const adminDoc = await db.collection('admins').doc(decoded.id).get();
  if (!adminDoc.exists) {
    throw new ApiError('Admin not found', 401);
  }
  const admin = { id: adminDoc.id, ...adminDoc.data() };
  if (admin.isVerified === false) {
    throw new ApiError('Email not verified. Please verify your email to continue.', 403);
  }
  req.admin = {
    id: admin.id,
    email: admin.email,
    role: decoded.role,
    ...(admin.name && { name: admin.name })
  };
  next();
});

module.exports = { authenticateUser, authenticateAdmin };
