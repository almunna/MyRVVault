const User = require('../User/User');
const { ApiError } = require('../../../errors/errorHandler');
const asyncHandler = require('../../../utils/asyncHandler');
const tokenService = require('../../../utils/tokenService');
const emailService = require('../../../utils/emailService');
const bcrypt = require('bcrypt');
const RV = require('../RV/RV');

exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate({
            path: 'rvIds',
            select: 'nickname currentMileage isOverdueForMaintenance isSold',
        })
        .populate('selectedRvId', 'nickname currentMileage isOverdueForMaintenance isSold isUpcomingMaintenance')
        .populate({
            path: 'soldRvs',
            populate: {
                path: 'rvId',
                select: 'nickname',
            },
        })
        .select('-password');
    if (!user) throw new ApiError('User not found', 404);
    return res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        user,
    });
});


exports.updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { name, phone, currentMileage } = req.body;
    const update = { name, phone, currentMileage };
    if (req.file) {
        update.profilePic = req.file.location;
    }
    const user = await User.findById(userId);
    if (!user) throw new ApiError('User not found', 404);
    const selectedRv = user.selectedRvId;
    if (selectedRv) {
        const rv = await RV.findByIdAndUpdate(selectedRv, { currentMileage }, { new: true });
        if (!rv) throw new ApiError('RV not found', 404);
    }
    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password')
        .populate('rvIds', 'nickname currentMileage isOverdueForMaintenance isSold')
        .populate('selectedRvId', 'nickname currentMileage isOverdueForMaintenance isSold isUpcomingMaintenance')

    return res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        user: updatedUser,
    });
});



exports.changePassword = asyncHandler(async (req, res) => { // start of change password function
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user.id); // get user from database
    if (!user) throw new ApiError('User not found', 404); // if user does not exist, throw error
    if (newPassword !== confirmPassword) throw new ApiError('Confirm password do not match', 400); // if new and confirm password do not match, throw error
    if (oldPassword === newPassword) throw new ApiError('New password cannot be the same as the old password', 400); // if new password is the same as old password, throw error
    const isMatch = await bcrypt.compare(oldPassword, user.password); // compare old password with stored password in database
    if (!isMatch) throw new ApiError('Invalid old password', 404); // if old password is invalid, throw error
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword; // update user password
    await user.save(); // save user to database
    return res.status(200).json({ // return success message
        success: true,
        message: 'Password changed successfully'
    });
});


exports.deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id); // get user from database
    if (!user) throw new ApiError('User not found', 404); // if user does not exist, throw error
    await user.deleteOne(); // delete user from database
    return res.status(200).json({ // return success message
        success: true,
        message: 'Account deleted successfully'
    });
});


exports.selectRV = asyncHandler(async (req, res) => {
    const { rvId } = req.body;
    const user = await User.findById(req.user.id); // get user from database
    if (!user) throw new ApiError('User not found', 404); // if user does not exist, throw error
    if (user.rvIds.length > 1) {
        user.selectedRvId = rvId; // update user selected rv id
    } else {
        user.selectedRvId = user.rvIds[0]; // update user selected rv id
    }
    await user.save(); // save user to database
    return res.status(200).json({ // return success message
        success: true,
        message: 'RV selected successfully'
    });
});


exports.sellRv = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { rvId, sellingPrice, sellingMileage, sellingDate } = req.body;

    // Validate required fields
    if (!rvId || !sellingPrice || !sellingMileage || !sellingDate) {
        throw new ApiError('All fields are required: rvId, sellingPrice, sellingMileage, sellingDate', 400);
    }

    // Validate selling price > 0
    if (sellingPrice <= 0) {
        throw new ApiError('Selling price must be greater than 0', 400);
    }

    // Validate selling mileage >= 0
    if (sellingMileage < 0) {
        throw new ApiError('Selling mileage cannot be negative', 400);
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    // Check if RV belongs to user
    const rvBelongsToUser = user.rvIds.some(id => id.toString() === rvId.toString());
    if (!rvBelongsToUser) {
        throw new ApiError('RV does not belong to this user', 403);
    }

    // Check if RV is already sold
    const alreadySold = user.soldRvs.some(soldRv => soldRv.rvId.toString() === rvId.toString());
    if (alreadySold) {
        throw new ApiError('This RV has already been sold', 400);
    }

    // Get RV details
    const rv = await RV.findById(rvId);
    if (!rv) throw new ApiError('RV not found', 404);

    // Check if RV is already marked as sold
    if (rv.isSold) {
        throw new ApiError('This RV is already marked as sold', 400);
    }

    // Mark RV as sold
    rv.isSold = true;
    await rv.save();

    // Add to user's soldRvs array
    user.soldRvs.push({
        rvId,
        sellingPrice,
        sellingMileage,
        sellingDate: new Date(sellingDate)
    });
    await user.save();

    return res.status(200).json({
        success: true,
        message: 'RV sold successfully',
        soldRv: {
            rvId,
            sellingPrice,
            sellingMileage,
            sellingDate
        }
    });
});


exports.getSoldRvs = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get user with populated soldRvs
    const user = await User.findById(userId)
        .populate({
            path: 'soldRvs.rvId',
            select: 'nickname manufacturer modelName modelYear currentMileage isSold'
        });

    if (!user) throw new ApiError('User not found', 404);

    return res.status(200).json({
        success: true,
        message: 'Sold RVs retrieved successfully',
        count: user.soldRvs.length,
        soldRvs: user.soldRvs
    });
});
