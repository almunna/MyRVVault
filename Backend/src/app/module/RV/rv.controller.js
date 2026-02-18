const RV = require('./RV');
const asyncHandler = require('../../../utils/asyncHandler');
const User = require('../User/User');
const queryBuilder = require('../../../builder/queryBuilder');

exports.addRv = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const rv = await RV.create({ ...req.body, user: userId });
    const user = await User.findById(userId);

    if (user) {
        user.rvIds.push(rv._id);
        user.selectedRvId = rv._id;
        await user.save();
    }



    res.status(201).json({
        success: true,
        data: rv
    });
});


exports.getUserRvs = asyncHandler(async (req, res) => {
    const rvQuery = new queryBuilder(RV.find({ user: req.user.id }), req.query)
        .search(['brand', 'model', 'nickName'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await rvQuery.modelQuery;
    const meta = await rvQuery.countTotal();

    res.status(200).json({
        success: true,
        meta,
        data: result
    });
});




exports.getRv = asyncHandler(async (req, res) => {
    const rv = await RV.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: rv
    })
})

exports.updateRv = asyncHandler(async (req, res) => {
    const rv = await RV.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    })
    res.status(200).json({
        success: true,
        data: rv
    })
})

exports.deleteRv = asyncHandler(async (req, res) => {
    const rv = await RV.findByIdAndDelete(req.params.id);
    // Remove the deleted RV's ID from all users' rvIds arrays
    if (rv) {
        const User = require('../User/User');
        await User.updateMany(
            { rvIds: rv._id },
            { $pull: { rvIds: rv._id } }
        );
    }
    res.status(200).json({
        success: true,
        data: rv
    })
})

exports.updateCurrentMileage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { currentMileage } = req.body;

    if (typeof currentMileage !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'currentMileage must be a number'
        });
    }

    const rv = await RV.findById(id);
    if (!rv) {
        return res.status(404).json({
            success: false,
            message: 'RV not found'
        });
    }

    rv.currentMileage = currentMileage;
    await rv.save();

    res.status(200).json({
        success: true,
        message: 'Current mileage updated successfully',
        data: rv
    });
});


//for admin
exports.getRvs = asyncHandler(async (req, res) => {
    const rvs = await RV.find();
    res.status(200).json({
        success: true,
        data: rvs
    })
})