const { db, FieldValue } = require('../../../config/db');
const { ApiError } = require('../../../errors/errorHandler');
const tokenService = require('../../../utils/tokenService');
const emailService = require('../../../utils/emailService');
const bcrypt = require('bcrypt');
// const { OAuth2Client } = require('google-auth-library'); // not needed — using userinfo endpoint
// const appleSignin = require('apple-signin-auth'); // Apple login — disabled

// Helper: find user by email
async function findUserByEmail(email) {
  const snap = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Helper: find tempUser by email
async function findTempUserByEmail(email) {
  const snap = await db.collection('tempUsers').where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

// Helper: delete tempUser by email
async function deleteTempUserByEmail(email) {
  const snap = await db.collection('tempUsers').where('email', '==', email).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

// REGISTER
exports.signup = async (req, res, next) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      throw new ApiError('Password and confirm password do not match', 400);
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new ApiError('User already exists', 409);
    }

    // Remove any existing temp user
    await deleteTempUserByEmail(email);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationCode = tokenService.generateVerificationCode();

    await db.collection('tempUsers').add({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      role: 'USER',
      isVerified: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    try {
      emailService.sendVerificationCode(email, verificationCode);
      return res.status(201).json({
        success: true,
        message: 'Please verify your email to complete registration',
        email
      });
    } catch (emailError) {
      await deleteTempUserByEmail(email);
      return next(new ApiError('Failed to send verification email', 500));
    }
  } catch (err) {
    return next(err);
  }
};

// EMAIL VERIFICATION
exports.verifyEmail = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    const tempUser = await findTempUserByEmail(email);
    if (!tempUser) throw new ApiError('No pending verification for this email', 404);
    if (tempUser.verificationCode !== code) {
      throw new ApiError('Invalid verification code', 400);
    }
    if (tempUser.verificationCodeExpiresAt && new Date(tempUser.verificationCodeExpiresAt.toDate ? tempUser.verificationCodeExpiresAt.toDate() : tempUser.verificationCodeExpiresAt) < new Date()) {
      throw new ApiError('Verification code has expired', 400);
    }

    const { name, phone, password } = tempUser;
    const userRef = await db.collection('users').add({
      name,
      email,
      phone: phone || null,
      password,
      isVerified: true,
      role: 'USER',
      rvIds: [],
      selectedRvId: null,
      provider: 'local',
      isBlocked: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await deleteTempUserByEmail(email);
    await emailService.sendWelcomeEmail(email, name, tempUser.role);

    const accessToken = tokenService.generateAccessToken({ id: userRef.id, role: 'USER' });
    const refreshToken = tokenService.generateRefreshToken({ id: userRef.id, role: 'USER' });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You are now logged in.',
      accessToken,
      refreshToken,
      user: { id: userRef.id, name, email, rv: 0 }
    });
  } catch (err) {
    return next(err);
  }
};

// LOGIN
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) throw new ApiError('User not found', 404);
    if (!user.isVerified) throw new ApiError('Email not verified', 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError('Invalid email or password', 401);

    const accessToken = tokenService.generateAccessToken({ id: user.id, role: user.role, selectedRvId: user.selectedRvId });
    const refreshToken = tokenService.generateRefreshToken({ id: user.id, role: user.role, selectedRvId: user.selectedRvId });

    // Fetch RV details
    const rvIds = user.rvIds || [];
    const rvDetails = await Promise.all(
      rvIds.map(async (rvId) => {
        const rvDoc = await db.collection('rvs').doc(rvId).get();
        if (!rvDoc.exists) return null;
        const rv = rvDoc.data();
        return { id: rvDoc.id, chassisId: rv.chassis || null, isSold: rv.isSold, condition: rv.condition };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rv: rvDetails.filter(Boolean),
        selectedRvId: user.selectedRvId
      }
    });
  } catch (err) {
    return next(err);
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) throw new ApiError('User not found', 404);
    const resetCode = tokenService.generateVerificationCode();
    await db.collection('users').doc(user.id).update({
      passwordResetCode: resetCode,
      passwordResetCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      updatedAt: FieldValue.serverTimestamp()
    });
    await emailService.sendPasswordResetCode(email, resetCode);
    return res.status(200).json({ success: true, message: 'Password reset code sent to your email.' });
  } catch (err) {
    return next(err);
  }
};

// RESEND PASSWORD RESET CODE
exports.resendPasswordResetCode = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) throw new ApiError('User not found', 404);
    if (!user.passwordResetCode) throw new ApiError('No password reset code available', 400);
    const resetCode = tokenService.generateVerificationCode();
    await db.collection('users').doc(user.id).update({
      passwordResetCode: resetCode,
      passwordResetCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      updatedAt: FieldValue.serverTimestamp()
    });
    await emailService.sendPasswordResetCode(email, resetCode);
    return res.status(200).json({ success: true, message: 'Password reset code resent to your email.' });
  } catch (err) {
    return next(err);
  }
};

// VERIFY CODE
exports.verifyCode = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) throw new ApiError('User not found', 404);
    const expiresAt = user.passwordResetCodeExpiresAt;
    const expired = expiresAt ? new Date(expiresAt.toDate ? expiresAt.toDate() : expiresAt) < new Date() : true;
    const valid = user.passwordResetCode === code && !expired;
    if (!valid) throw new ApiError('Invalid or expired code', 400);
    return res.status(200).json({ success: true, message: 'Code is valid.' });
  } catch (err) {
    return next(err);
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.collection('users').doc(user.id).update({
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetCodeExpiresAt: null,
      updatedAt: FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// RESEND VERIFICATION CODE
exports.resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  try {
    let user = await findUserByEmail(email);
    let isTempUser = false;
    if (!user) {
      user = await findTempUserByEmail(email);
      isTempUser = true;
      if (!user) throw new ApiError('User not found', 404);
    }
    if (user.isVerified) throw new ApiError('Email already verified', 403);
    const code = tokenService.generateVerificationCode();
    const collection = isTempUser ? 'tempUsers' : 'users';
    await db.collection(collection).doc(user.id).update({
      verificationCode: code,
      verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      updatedAt: FieldValue.serverTimestamp()
    });
    await emailService.sendVerificationCode(email, code);
    return res.status(200).json({ success: true, message: 'Verification code resent to your email.' });
  } catch (err) {
    return next(err);
  }
};

// ADMIN LOGIN
exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const snap = await db.collection('admins').where('email', '==', email).limit(1).get();
    if (snap.empty) throw new ApiError('Admin not found', 404);
    const adminDoc = snap.docs[0];
    const admin = { id: adminDoc.id, ...adminDoc.data() };

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new ApiError('Invalid email or password', 401);

    const accessToken = tokenService.generateAccessToken({ id: admin.id, role: admin.role });
    const refreshToken = tokenService.generateRefreshToken({ id: admin.id, role: admin.role });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      admin: { id: admin.id, name: admin.name, email: admin.email }
    });
  } catch (err) {
    return next(err);
  }
};

// ADMIN FORGOT PASSWORD
exports.adminForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const snap = await db.collection('admins').where('email', '==', email).limit(1).get();
    if (snap.empty) throw new ApiError('Admin not found', 404);
    const adminDoc = snap.docs[0];
    const code = tokenService.generateVerificationCode();
    await adminDoc.ref.update({
      passwordResetCode: { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      updatedAt: FieldValue.serverTimestamp()
    });
    await emailService.sendPasswordResetCode(email, code);
    return res.status(200).json({ success: true, message: 'Password reset code sent to your email.' });
  } catch (err) {
    return next(err);
  }
};

// ADMIN VERIFY RESET CODE
exports.adminVerifyCode = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    const snap = await db.collection('admins').where('email', '==', email).limit(1).get();
    if (snap.empty) throw new ApiError('Admin not found', 404);
    const admin = { id: snap.docs[0].id, ...snap.docs[0].data() };
    if (!admin.passwordResetCode || admin.passwordResetCode.code !== code) {
      throw new ApiError('Invalid reset code', 400);
    }
    const expiresAt = admin.passwordResetCode.expiresAt;
    if (new Date(expiresAt.toDate ? expiresAt.toDate() : expiresAt) < new Date()) {
      throw new ApiError('Reset code has expired', 400);
    }
    return res.status(200).json({ success: true, message: 'Reset code verified successfully.' });
  } catch (err) {
    return next(err);
  }
};

// ADMIN RESET PASSWORD
exports.adminResetPassword = async (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;
  try {
    const snap = await db.collection('admins').where('email', '==', email).limit(1).get();
    if (snap.empty) throw new ApiError('Admin not found', 404);
    const adminDoc = snap.docs[0];
    if (newPassword !== confirmPassword) throw new ApiError('Passwords do not match', 400);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await adminDoc.ref.update({
      password: hashedPassword,
      passwordResetCode: null,
      passwordResetCodeExpiresAt: null,
      updatedAt: FieldValue.serverTimestamp()
    });
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return next(err);
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res, next) => {
  try {
    const { accessToken: googleAccessToken } = req.body;
    if (!googleAccessToken) throw new ApiError('Google access token is required', 400);

    // Verify token and fetch user info from Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );
    if (!response.ok) throw new ApiError('Invalid Google access token', 401);

    const payload = await response.json();
    if (!payload.email) throw new ApiError('Could not retrieve email from Google', 401);
    if (!payload.email_verified) throw new ApiError('Google email must be verified to continue', 403);

    const email = payload.email;
    const providerId = payload.sub;

    // Find by email first, then by providerId
    let user = await findUserByEmail(email);
    if (!user) {
      const snap = await db.collection('users')
        .where('providerId', '==', providerId)
        .where('provider', '==', 'google')
        .limit(1).get();
      if (!snap.empty) user = { id: snap.docs[0].id, ...snap.docs[0].data() };
    }

    if (!user) {
      // New user — create account
      const userRef = await db.collection('users').add({
        name: payload.name || payload.given_name || email.split('@')[0],
        email,
        profilePic: payload.picture || null,
        isVerified: true,
        role: 'USER',
        provider: 'google',
        providerId,
        rvIds: [],
        selectedRvId: null,
        isBlocked: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      user = { id: userRef.id, rvIds: [], selectedRvId: null, name: payload.name, email };
    } else if (user.provider !== 'google') {
      // Link Google to existing email account
      await db.collection('users').doc(user.id).update({
        provider: 'google',
        providerId,
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    const accessToken = tokenService.generateAccessToken({ id: user.id, role: user.role || 'USER', selectedRvId: user.selectedRvId });
    const refreshToken = tokenService.generateRefreshToken({ id: user.id, role: user.role || 'USER', selectedRvId: user.selectedRvId });

    const rvIds = user.rvIds || [];
    const rvDetails = await Promise.all(
      rvIds.map(async (rvId) => {
        const rvDoc = await db.collection('rvs').doc(rvId).get();
        if (!rvDoc.exists) return null;
        const rv = rvDoc.data();
        return { id: rvDoc.id, chassisId: rv.chassis || null, isSold: rv.isSold, condition: rv.condition };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rv: rvDetails.filter(Boolean),
        selectedRvId: user.selectedRvId
      }
    });
  } catch (err) {
    next(err);
  }
};

// APPLE LOGIN — commented out, not in use
// exports.appleLogin = async (req, res, next) => {
//   try {
//     const { idToken } = req.body;
//     if (!idToken) throw new ApiError('Apple ID token is required', 400);
//
//     const payload = await appleSignin.verifyIdToken(idToken, {
//       audience: process.env.APPLE_CLIENT_ID,
//       ignoreExpiration: false
//     });
//     if (!payload?.sub) throw new ApiError('Invalid Apple token', 401);
//
//     const email = payload.email || null;
//     const providerId = payload.sub;
//
//     let user = email ? await findUserByEmail(email) : null;
//     if (!user) {
//       const snap = await db.collection('users')
//         .where('providerId', '==', providerId)
//         .where('provider', '==', 'apple')
//         .limit(1).get();
//       if (!snap.empty) user = { id: snap.docs[0].id, ...snap.docs[0].data() };
//     }
//
//     if (!user) {
//       const userRef = await db.collection('users').add({
//         name: email ? email.split('@')[0] : 'Apple User',
//         email,
//         isVerified: true,
//         role: 'USER',
//         provider: 'apple',
//         providerId,
//         rvIds: [],
//         selectedRvId: null,
//         isBlocked: false,
//         createdAt: FieldValue.serverTimestamp(),
//         updatedAt: FieldValue.serverTimestamp()
//       });
//       user = { id: userRef.id, rvIds: [], selectedRvId: null };
//     }
//
//     const accessToken = tokenService.generateAccessToken({ id: user.id, role: user.role || 'USER', selectedRvId: user.selectedRvId });
//     const refreshToken = tokenService.generateRefreshToken({ id: user.id, role: user.role || 'USER', selectedRvId: user.selectedRvId });
//
//     return res.status(200).json({
//       success: true,
//       message: 'Apple login successful',
//       accessToken,
//       refreshToken,
//       user: { id: user.id, name: user.name, email: user.email, rv: [], selectedRvId: user.selectedRvId }
//     });
//   } catch (err) {
//     next(err);
//   }
// };
