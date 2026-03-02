const { db, FieldValue, Timestamp } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');

const userCol = () => db.collection('users');
const rvCol = () => db.collection('rvs');

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];


exports.getAllUsersMonthlyGrowthAndTotalRvAddingGrowth = asyncHandler(async (req, res) => {
    const year = parseInt(req.params.year);

    // Fetch all RVs created in that year
    const startOfYear = Timestamp.fromDate(new Date(year, 0, 1));
    const startOfNext = Timestamp.fromDate(new Date(year + 1, 0, 1));

    const rvSnap = await rvCol()
        .where('createdAt', '>=', startOfYear)
        .where('createdAt', '<', startOfNext)
        .get();

    const monthlyGrowth = {};
    let totalRvAddingGrowth = 0;

    queryToArr(rvSnap).forEach(rv => {
        const month = new Date(rv.createdAt).toLocaleString('default', { month: 'long' });
        monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
        totalRvAddingGrowth++;
    });

    res.status(200).json({
        success: true,
        message: 'All users monthly growth and total RV adding growth',
        monthlyGrowth,
        totalRvAddingGrowth
    });
});


exports.getUsers = asyncHandler(async (req, res) => {
    const snap = await userCol().orderBy('createdAt', 'desc').get();
    const users = queryToArr(snap).map(u => { const c = { ...u }; delete c.password; return c; });

    res.status(200).json({ success: true, message: 'Users retrieved successfully', users });
});


exports.getUserById = asyncHandler(async (req, res) => {
    const snap = await userCol().doc(req.params.id).get();
    if (!snap.exists) return res.status(200).json({ success: true, message: 'User retrieved successfully', user: null });

    const user = docToObj(snap);
    delete user.password;

    res.status(200).json({ success: true, message: 'User retrieved successfully', user });
});


exports.toggleBlockUser = asyncHandler(async (req, res) => {
    const snap = await userCol().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('User not found', 404);

    const user = docToObj(snap);
    const isBlocked = !user.isBlocked;
    await userCol().doc(req.params.id).update({ isBlocked, updatedAt: FieldValue.serverTimestamp() });

    const updated = docToObj(await userCol().doc(req.params.id).get());
    delete updated.password;

    const message = isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
    res.status(200).json({ success: true, message, user: updated });
});


exports.deleteUser = asyncHandler(async (req, res) => {
    const snap = await userCol().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('User not found', 404);

    const user = docToObj(snap);
    delete user.password;

    await userCol().doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'User deleted successfully', user });
});


exports.getDashboardData = asyncHandler(async (req, res) => {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    const startOfYear = Timestamp.fromDate(new Date(year, 0, 1));
    const startOfNext = Timestamp.fromDate(new Date(year + 1, 0, 1));

    // Initialize monthly buckets
    const monthlyUserGrowth = {};
    const monthlyRvGrowth = {};
    monthNames.forEach(m => { monthlyUserGrowth[m] = 0; monthlyRvGrowth[m] = 0; });

    // All users (for total count and user growth)
    const usersSnap = await userCol().get();
    const allUsers = queryToArr(usersSnap);
    const totalUsers = allUsers.length;

    allUsers.forEach(user => {
        if (!user.createdAt) return;
        const created = new Date(user.createdAt);
        if (created.getFullYear() === year) {
            const month = created.toLocaleString('default', { month: 'long' });
            monthlyUserGrowth[month] = (monthlyUserGrowth[month] || 0) + 1;
        }
    });

    // RVs created in that year
    const rvsSnap = await rvCol()
        .where('createdAt', '>=', startOfYear)
        .where('createdAt', '<', startOfNext)
        .get();
    const yearRvs = queryToArr(rvsSnap);
    let totalRvAddingGrowth = yearRvs.length;

    yearRvs.forEach(rv => {
        if (!rv.createdAt) return;
        const month = new Date(rv.createdAt).toLocaleString('default', { month: 'long' });
        monthlyRvGrowth[month] = (monthlyRvGrowth[month] || 0) + 1;
    });

    // Cumulative user growth
    let cumulativeUsers = 0;
    const cumulativeUserGrowth = {};
    monthNames.forEach(month => {
        cumulativeUsers += monthlyUserGrowth[month];
        cumulativeUserGrowth[month] = cumulativeUsers;
    });

    res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
            analytics: {
                monthlyUserGrowth,
                monthlyRvGrowth,
                cumulativeUserGrowth,
                totalUsers,
                totalRvAddingGrowth,
                year
            }
        }
    });
});
