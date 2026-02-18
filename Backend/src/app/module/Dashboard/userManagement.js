const User = require('../User/User');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');



exports.getAllUsersMonthlyGrowthAndTotalRvAddingGrowth = asyncHandler(async (req, res) => {
    const year = req.params.year;
    const users = await User.find({}, { password: 0 }).populate({
        path: 'rvIds',
        match: { createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) } }
    });

    const monthlyGrowth = {};
    users.forEach(user => {
        user.rvIds.forEach(rv => {
            const month = new Date(rv.createdAt).toLocaleString('default', { month: 'long' });
            if (!monthlyGrowth[month]) {
                monthlyGrowth[month] = 1;
            } else {
                monthlyGrowth[month] += 1;
            }
        });
    });

    const totalRvAddingGrowth = users.reduce((acc, user) => {
        return acc + user.rvIds.length;
    }, 0);
    console.log(monthlyGrowth);
    res.status(200).json({
        success: true,
        message: 'All users monthly growth and total RV adding growth',
        monthlyGrowth,
        totalRvAddingGrowth
    });
});


exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        users
    });
});

exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        user
    });
});

exports.toggleBlockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    user.isBlocked = !user.isBlocked;
    await user.save();
    const message = user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
    res.status(200).json({
        success: true,
        message,
        user
    });
});

exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id).select('-password');
    if (!user) throw new ApiError('User not found', 404);
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        user
    });
});

exports.getDashboardData = asyncHandler(async (req, res) => {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    // Get all users with their RVs for the year
    const users = await User.find({}, { password: 0 })
        .populate({
            path: 'rvIds',
            match: { 
                createdAt: { 
                    $gte: new Date(year, 0, 1), 
                    $lt: new Date(year + 1, 0, 1) 
                } 
            }
        })
        .sort({ createdAt: -1 });

    // Initialize monthly data objects
    const monthlyUserGrowth = {};
    const monthlyRvGrowth = {};
    
    // Initialize all months with 0
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthNames.forEach(month => {
        monthlyUserGrowth[month] = 0;
        monthlyRvGrowth[month] = 0;
    });

    // Calculate user growth by month
    users.forEach(user => {
        const userMonth = new Date(user.createdAt).toLocaleString('default', { month: 'long' });
        if (new Date(user.createdAt).getFullYear() === year) {
            monthlyUserGrowth[userMonth] = (monthlyUserGrowth[userMonth] || 0) + 1;
        }
        
        // Calculate RV growth by month
        user.rvIds.forEach(rv => {
            const rvMonth = new Date(rv.createdAt).toLocaleString('default', { month: 'long' });
            monthlyRvGrowth[rvMonth] = (monthlyRvGrowth[rvMonth] || 0) + 1;
        });
    });

    // Calculate cumulative user growth
    let cumulativeUsers = 0;
    const cumulativeUserGrowth = {};
    monthNames.forEach(month => {
        cumulativeUsers += monthlyUserGrowth[month];
        cumulativeUserGrowth[month] = cumulativeUsers;
    });

    // Calculate total RV adding growth
    const totalRvAddingGrowth = users.reduce((acc, user) => acc + user.rvIds.length, 0);

    // Calculate total users
    const totalUsers = users.length;

    // Prepare response
    const response = {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
            // users: users.map(user => {
            //     const userObj = user.toObject();
            //     delete userObj.rvIds; // Remove RV data from user objects
            //     return userObj;
            // }),
            analytics: {
                monthlyUserGrowth,
                monthlyRvGrowth,
                cumulativeUserGrowth,
                totalUsers,
                totalRvAddingGrowth,
                year
            }
        }
    };

    res.status(200).json(response);
});