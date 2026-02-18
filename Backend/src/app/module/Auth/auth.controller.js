const asyncHandler = require('../../../utils/asyncHandler');
const User = require('./../User/User');
const Admin = require('./../Admin/Admin');
const TempUser = require('./../TempUser/TempUser');
const { ApiError } = require('../../../errors/errorHandler');
const tokenService = require('../../../utils/tokenService');
const emailService = require('../../../utils/emailService');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const googleClient = new OAuth2Client();

//REGISTER
exports.signup = async (req, res, next) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    try {
        // Check if password and confirm password match
        if (password !== confirmPassword) {
            throw new ApiError('Password and confirm password do not match', 400);
        }

        // Check if user already exists in main User collection
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new ApiError('User already exists', 409);
        }

        // Check if there's a pending verification in TempUser
        let tempUser = await TempUser.findOne({ email });
        if (tempUser) {
            await TempUser.findOneAndDelete({ email });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification code using tokenService
        const verificationCode = tokenService.generateVerificationCode();

        // Create temporary user
        tempUser = new TempUser({
            name,
            email,
            phone,
            password: hashedPassword,
            verificationCode: verificationCode,
            verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            role: 'USER'
        });

        await tempUser.save();

        // Send verification email
        try {
            emailService.sendVerificationCode(email, verificationCode);
            return res.status(201).json({
                success: true,
                message: 'Please verify your email to complete registration',
                email
            });
        } catch (emailError) {
            await TempUser.findOneAndDelete({ email });
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
        const tempUser = await TempUser.findOne({ email });
        if (!tempUser) throw new ApiError('No pending verification for this email', 404);
        if (tempUser.verificationCode !== code) {
            throw new ApiError('Invalid verification code', 400);
        }
        if (tempUser.verificationCode.expiresAt < new Date()) {
            throw new ApiError('Verification code has expired', 400);
        }
        // Move user from TempUser to User
        const { name, phone, password } = tempUser;

        const user = new User({ name, email, phone, password, isVerified: true });


        await user.save();
        await TempUser.deleteOne({ email });
        await emailService.sendWelcomeEmail(email, name, tempUser.role);

        // Auto-login: generate tokens
        const accessToken = tokenService.generateAccessToken({ id: user._id, role: tempUser.role });
        const refreshToken = tokenService.generateRefreshToken({ id: user._id, role: tempUser.role });

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully. You are now logged in.',
            accessToken,
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email, rv: user.rvIds.length }
        });
    } catch (err) {
        return next(err);
    }
};

// LOGIN
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password').populate('rvIds');

        if (!user) throw new ApiError('User not found', 404);

        if (!user?.isVerified) throw new ApiError('Email not verified', 403);

        // Check if user password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new ApiError('Invalid email or password', 401);

        // Generate tokens
        const accessToken = tokenService.generateAccessToken({ id: user._id, role: user.role, selectedRvId: user.selectedRvId });
        const refreshToken = tokenService.generateRefreshToken({ id: user._id, role: user.role, selectedRvId: user.selectedRvId });

        const rvDetails = user.rvIds.map(rv => ({
            id: rv._id,
            chassisId: rv.chassis,
            isSold: rv.isSold,
            condition: rv.condition

        }));


        return res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                rv: rvDetails,
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
        const user = await User.findOne({ email });
        if (!user) throw new ApiError('User not found', 404);
        const resetCode = tokenService.generateVerificationCode();
        user.passwordResetCode = resetCode;
        user.passwordResetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        if (user) await user.save();
        // Send password reset code
        await emailService.sendPasswordResetCode(email, resetCode);

        return res.status(200).json({
            success: true,
            message: 'Password reset code sent to your email.'
        });
    } catch (err) {
        return next(err);
    }
};

// RESEND PASSWORD RESET CODE
exports.resendPasswordResetCode = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) throw new ApiError('User not found', 404);
        if (!user.passwordResetCode) throw new ApiError('No password reset code available', 400);

        const resetCode = tokenService.generateVerificationCode();
        user.passwordResetCode = resetCode;
        user.passwordResetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();
        await emailService.sendPasswordResetCode(email, resetCode);

        return res.status(200).json({
            success: true,
            message: 'Password reset code resent to your email.'
        });
    } catch (err) {
        return next(err);
    }
};



// VERIFY CODE (for generic code verification, e.g. resend/validate)
exports.verifyCode = async (req, res, next) => {
    const { email, code } = req.body; // type: 'verification' or 'reset'
    try {
        const user = await User.findOne({ email });
        if (!user) throw new ApiError('User not found', 404);
        const valid = user?.passwordResetCode === code && user.passwordResetCodeExpiresAt > Date.now();
        if (!valid) throw new ApiError('Invalid or expired code', 400);
        return res.status(200).json({
            success: true,
            message: 'Code is valid.'
        });
    } catch (err) {
        return next(err);
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        // 2. Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // 1. Validate password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }




        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 4. Clear reset code fields
        user.passwordResetCode = undefined;
        user.passwordResetCodeExpiresAt = undefined;

        // 5. Save user
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.resendVerificationCode = async (req, res, next) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });

        // If user is not found, check in TempUser
        if (!user) {
            user = await TempUser.findOne({ email });
            if (!user) throw new ApiError('User not found', 404);
        }

        if (user.isVerified) throw new ApiError('Email already verified', 403);
        const code = tokenService.generateVerificationCode();
        user.verificationCode = code; // Store only the code as a string
        user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Separate expiration field
        await user.save();

        // Send verification code
        await emailService.sendVerificationCode(email, code);

        return res.status(200).json({
            success: true,
            message: 'Verification code resent to your email.'
        });
    } catch (err) {
        return next(err);
    }
};

// ADMIN LOGIN
exports.adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) throw new ApiError('Admin not found', 404);

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) throw new ApiError('Invalid email or password', 401);

        const accessToken = tokenService.generateAccessToken({ id: admin._id, role: admin.role });
        const refreshToken = tokenService.generateRefreshToken({ id: admin._id, role: admin.role });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            admin: { id: admin._id, name: admin.name, email: admin.email },
        });
    } catch (err) {
        return next(err);
    }
};

// ADMIN FORGOT PASSWORD
exports.adminForgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) throw new ApiError('Admin not found', 404);
        admin.passwordResetCode = {
            code: tokenService.generateVerificationCode(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };

        await admin.save();
        // Send password reset code
        await emailService.sendPasswordResetCode(email, admin.passwordResetCode.code.toString());

        return res.status(200).json({
            success: true,
            message: 'Password reset code sent to your email.'
        });
    } catch (err) {
        return next(err);
    }
};

// ADMIN VERIFY RESET CODE
exports.adminVerifyCode = async (req, res, next) => {
    const { email, code } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) throw new ApiError('Admin not found', 404);
        if (admin.passwordResetCode.code !== code) {
            throw new ApiError('Invalid reset code', 400);
        }
        if (admin.passwordResetCode.expiresAt < new Date()) {
            throw new ApiError('Reset code has expired', 400);
        }
        return res.status(200).json({
            success: true,
            message: 'Reset code verified successfully.'
        });
    } catch (err) {
        return next(err);
    }
};

// ADMIN RESET PASSWORD
exports.adminResetPassword = async (req, res, next) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) throw new ApiError('Admin not found', 404);
        if (newPassword !== confirmPassword) {
            throw new ApiError('Passwords do not match', 400);
        }
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        admin.passwordResetCode = undefined;
        admin.passwordResetCodeExpiresAt = undefined;
        await admin.save();
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        return next(err);
    }
};



exports.socialLogin = async (req, res, next) => {
    try {
        const { provider, idToken } = req.body;

        if (!provider || !idToken) {
            throw new ApiError('Provider and ID token are required', 400);
        }

        let payload;

        // Allowed Google client IDs (Android / Web / iOS optional)
        const allowedAudiences = [
            process.env.GOOGLE_ANDROID_CLIENT_ID,
            process.env.GOOGLE_WEB_CLIENT_ID,
            process.env.GOOGLE_IOS_CLIENT_ID
        ].filter(Boolean);

        // ===== GOOGLE LOGIN =====
        if (provider === 'google') {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: allowedAudiences,
            });

            payload = ticket.getPayload();
            if (!payload || !payload.email) throw new ApiError('Invalid Google token', 401);

            // Prevent account takeover using unverified Gmail aliases
            if (payload.email_verified !== true) {
                throw new ApiError('Google email must be verified to continue', 403);
            }
        }

        // ===== APPLE LOGIN =====
        else if (provider === 'apple') {
            payload = await appleSignin.verifyIdToken(idToken, {
                audience: process.env.APPLE_CLIENT_ID,
                ignoreExpiration: false,
            });

            if (!payload?.sub) throw new ApiError('Invalid Apple token', 401);
            // Apple may not always return email after first login — that is normal.
        }

        // ===== UNSUPPORTED PROVIDER =====
        else {
            throw new ApiError('Unsupported provider', 400);
        }

        // Extract identity
        const email = payload.email || null;
        const providerId = payload.sub;

        // Look up user by provider or email
        let user = await User.findOne({
            $or: [
                { email },
                { providerId, provider }
            ]
        });

        // Create new user if first login
        if (!user) {
            user = await User.create({
                name: payload.name || payload.given_name || (email ? email.split('@')[0] : 'User'),
                email,
                isVerified: true,
                role: 'USER',
                provider,
                providerId,
            });
        }
        // Convert local account to social login if needed
        else if (user.provider === 'local' || !user.provider) {
            user.provider = provider;
            user.providerId = providerId;
            await user.save();
        }

        // Issue your app tokens
        const accessToken = tokenService.generateAccessToken({
            id: user._id,
            role: user.role,
            selectedRvId: user.selectedRvId
        });

        const refreshToken = tokenService.generateRefreshToken({
            id: user._id,
            role: user.role,
            selectedRvId: user.selectedRvId
        });

        // Populate RV details to match normal login response
        await user.populate('rvIds');

        const rvDetails = (user.rvIds || []).map(rv => ({
            id: rv._id,
            chassisId: rv.chassis,
            isSold: rv.isSold,
            condition: rv.condition

        }));

        return res.status(200).json({
            success: true,
            message: `${provider} login successful`,
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                rv: rvDetails,
                selectedRvId: user.selectedRvId
            }
        });

    } catch (err) {
        next(err);
    }
};



