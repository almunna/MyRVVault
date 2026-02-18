const SellRv = require('./SellRv');
const asyncHandler = require('../../../utils/asyncHandler');
const User = require('../User/User');
const queryBuilder = require('../../../builder/queryBuilder');


const addSellRv = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const sellRv = await SellRv.create({ ...req.body, user: userId });
    const user = await User.findById(userId);

    if (user) {
        user.sellRvIds.push(sellRv._id);
        // user.selectedRvId = sellRv._id;
        await user.save();
    }

    if (req.body.selectedRvId) {
        await SellRv.findByIdAndUpdate(req.body.selectedRvId, { isSold: true });
    }

    res.status(201).json({
        success: true,
        data: sellRv
    });
});


const getUserSellRvs = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const totalRvs = await SellRv.countDocuments({ user: userId });

    const query = SellRv.find({ user: userId });
    const paginatedQuery = new queryBuilder(query, req.query)
        .filter()
        .sort()
        .paginate()
        .fields();

    const rvs = await paginatedQuery.modelQuery;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    res.status(200).json({
        success: true,
        count: rvs.length,
        total: totalRvs,
        page,
        limit,
        data: rvs
    });
});

const getSellRv = asyncHandler(async (req, res) => {
    const sellRv = await SellRv.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: sellRv
    })
})

const updateSellRv = asyncHandler(async (req, res) => {
    const sellRv = await SellRv.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    })
    res.status(200).json({
        success: true,
        data: sellRv
    })
})

const deleteSellRv = asyncHandler(async (req, res) => {
    const sellRv = await SellRv.findByIdAndDelete(req.params.id);
    // Remove the deleted SellRv's ID from all users' sellRvIds arrays
    if (sellRv) {
        await User.updateMany(
            { sellRvIds: sellRv._id },
            { $pull: { sellRvIds: sellRv._id } }
        );
    }
    res.status(200).json({
        success: true,
        data: sellRv
    })
})

module.exports = {
    addSellRv,
    getUserSellRvs,
    getSellRv,
    updateSellRv,
    deleteSellRv
};
