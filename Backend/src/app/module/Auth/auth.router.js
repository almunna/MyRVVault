const express = require('express');

const router = express.Router();

const { signup, verifyEmail, login, adminLogin, resendVerificationCode, forgotPassword, resetPassword, verifyCode, resendPasswordResetCode, adminForgotPassword, adminVerifyCode, adminResetPassword, googleLogin, refreshToken } = require('./auth.controller');


router.post('/register', signup);
router.post('/verify-email', verifyEmail);
router.post('/activate-account', verifyEmail); // alias used by frontend registerActivation
router.post('/login', login);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-reset-code', verifyCode);
router.post('/resend-password-reset-code', resendPasswordResetCode);
router.post('/admin-login', adminLogin);
router.post('/admin-forgot-password', adminForgotPassword);
router.post('/admin-verify-code', adminVerifyCode);
router.post('/admin-reset-password', adminResetPassword);
router.post('/google-login', googleLogin);
router.post('/refresh-token', refreshToken);
// router.post('/apple-login', appleLogin); // Apple login — disabled


module.exports = router;
// 700907