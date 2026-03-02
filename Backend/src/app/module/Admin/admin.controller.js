const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj } = require('../../../utils/firestoreHelper');
const bcrypt = require('bcrypt');

const col = () => db.collection('admins');

exports.makeAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) throw new ApiError('Name, email, and password are required', 400);

        // Check if admin with this email already exists
        const existing = await col().where('email', '==', email).limit(1).get();
        if (!existing.empty) throw new ApiError('Admin with this email already exists', 409);

        const hashedPassword = await bcrypt.hash(password, 10);
        const data = {
            name, email,
            password: hashedPassword,
            role: 'ADMIN',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };
        const ref = await col().add(data);
        const snap = await ref.get();

        const adminResponse = docToObj(snap);
        delete adminResponse.password;

        return res.status(201).json({ message: 'Admin created successfully', admin: adminResponse });
    } catch (error) {
        return next(error);
    }
};


exports.getProfile = async (req, res, next) => {
    try {
        const adminId = req.admin.id || req.admin._id;
        const snap = await col().doc(adminId).get();
        if (!snap.exists) throw new ApiError('Admin not found', 404);

        const admin = docToObj(snap);
        delete admin.password;

        return res.status(200).json({ admin });
    } catch (error) {
        return next(error);
    }
};


exports.updateAdminProfile = async (req, res) => {
    try {
        const id = req.admin.id || req.admin._id;
        const updateData = {
            name: req.body.name,
            contact: req.body.contact,
            address: req.body.address,
            updatedAt: FieldValue.serverTimestamp()
        };

        if (req.file) {
            updateData.profilePic = req.file.location.replace(/\\/g, '/').replace('public', '');
        }

        const snap = await col().doc(id).get();
        if (!snap.exists) return res.status(404).json({ success: false, message: 'Admin not found' });

        await col().doc(id).update(updateData);
        const admin = docToObj(await col().doc(id).get());
        delete admin.password;

        res.status(200).json({ success: true, data: admin, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error while updating admin profile' });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const id = req.admin.id;
        const snap = await col().doc(id).get();
        if (!snap.exists) throw new ApiError('Admin not found', 404);

        const admin = snap.data();
        const isMatch = await bcrypt.compare(req.body.oldPassword, admin.password);
        if (!isMatch) throw new ApiError('Invalid old password', 401);
        if (req.body.newPassword !== req.body.confirmNewPassword) throw new ApiError('New passwords do not match', 400);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
        await col().doc(id).update({ password: hashedPassword, updatedAt: FieldValue.serverTimestamp() });

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error while changing password' });
    }
};
