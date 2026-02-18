const Chassis = require('./Chassis');
const { ApiError } = require('../../../errors/errorHandler');
const asyncHandler = require('../../../utils/asyncHandler');
const RV = require('../RV/RV');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const checkValidRv = require('../../../utils/checkValidRv');

// @desc    Create a new chassis
// @route   POST /api/v1/chassis
// @access  Private
exports.createChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    // Use provided rvId or fallback to selected RV
    let rvId = req.body.rvId;
    if (!rvId && !selectedRvId) {
        throw new ApiError('No RV selected. Please select an RV first.', 400);
    }
    if (!rvId) rvId = selectedRvId;

    // Verify the user has access to the specified RV
    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add chassis for this RV', 403);
    }

    // Create the chassis
    const chassis = await Chassis.create({
        ...req.body,
        user: userId,
        rvId
    });

    // Update the RV with the new chassis ID (maintaining existing logic)
    const rv = await RV.findById(rvId);
    if (rv) {
        rv.chassis = chassis._id;
        await rv.save();
    }

    res.status(201).json({
        success: true,
        message: 'Chassis created successfully',
        data: chassis
    });
});


exports.createOrUpdateChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { id } = req.body; // if id is passed => update, otherwise create

    // ✅ If updating existing chassis
    if (id) {
        const chassis = await Chassis.findById(id);
        if (!chassis) throw new ApiError('Chassis not found', 404);

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== "id") {
                chassis[key] = req.body[key];
            }
        });

        // Handle file uploads
        if (req.files?.length > 0) {
            const oldImages = [...chassis.images];
            chassis.images = req.files.map(file => file.location);
            await chassis.save();
            await deleteS3Objects(oldImages);
        } else {
            await chassis.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Chassis updated successfully',
            data: chassis
        });
    }

    // ✅ If creating new chassis
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId || selectedRvId;
    if (!rvId) {
        throw new ApiError('No RV selected. Please select an RV first.', 400);
    }

    // Verify access
    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add chassis for this RV', 403);
    }

    // Create chassis
    const chassis = await Chassis.create({
        ...req.body,
        user: userId,
        rvId,
        images: req.files?.map(file => file.location) || []
    });

    // Attach chassis to RV
    const rv = await RV.findById(rvId);
    if (rv) {
        rv.chassis = chassis._id;
        await rv.save();
    }

    return res.status(201).json({
        success: true,
        message: 'Chassis created successfully',
        data: chassis
    });
});


// @desc    Get all chassis for the logged-in user's RV
// @route   GET /api/v1/chassis
// @access  Private
exports.getChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let rvId = req.query.rvId;
    if (!rvId && !selectedRvId) {
        throw new ApiError('No RV selected. Please select an RV first.', 400);
    }
    if (!rvId) rvId = selectedRvId;
    // console.log("rvId", rvId);

    // Verify the user has access to the specified RV
    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to view chassis for this RV', 403);
    }

    // console.log(rvId)
    const rv = await RV.findOne({ _id: rvId });
    // console.log(rv)
    const chassisId = rv.chassis;
    // console.log(chassisId)
    let chassis;
    if (!chassisId) {
        return res.status(200).json({
            success: true,
            message: 'No chassis found',
            data: {}
        });
    } else {
        chassis = await Chassis.findById({
            _id: chassisId
        });
    }

    if (!chassis) {
        return res.status(200).json({
            success: true,
            message: 'No chassis found',
            data: {}
        });
    }

    res.status(200).json({
        success: true,
        message: 'Chassis retrieved successfully',
        data: chassis
    });
});

// @desc    Get single chassis by ID
// @route   GET /api/v1/chassis/:id
// @access  Private
exports.getChassisById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const chassis = await Chassis.findOne({
        _id: req.params.id,
        user: userId
    }).populate('user', 'name email');

    if (!chassis) {
        throw new ApiError('Chassis not found or access denied', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Chassis retrieved successfully',
        data: chassis
    });
});

// @desc    Update a chassis
// @route   PUT /api/v1/chassis/:id
// @access  Private
// exports.updateChassis = asyncHandler(async (req, res) => {
//     const userId = req.user.id || req.user._id;

//     // First verify the chassis exists and belongs to the user
//     const existingChassis = await Chassis.findOne({
//         _id: req.params.id,
//         user: userId
//     });

//     if (!existingChassis) {
//         throw new ApiError('Chassis not found or access denied', 404);
//     }

//     // If rvId is being updated, verify the user has access to the new RV
//     if (req.body.rvId && req.body.rvId !== existingChassis.rvId.toString()) {
//         const hasAccess = await checkValidRv(userId, req.body.rvId);
//         if (!hasAccess) {
//             throw new ApiError('You do not have permission to assign this chassis to the specified RV', 403);
//         }

//         // If changing RVs, update the old and new RV references
//         const oldRv = await RV.findOne({ chassis: existingChassis._id });
//         if (oldRv) {
//             oldRv.chassis = undefined;
//             await oldRv.save();
//         }

//         const newRv = await RV.findById(req.body.rvId);
//         if (newRv) {
//             newRv.chassis = existingChassis._id;
//             await newRv.save();
//         }
//     }

//     const chassis = await Chassis.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//     );

//     res.status(200).json({
//         success: true,
//         message: 'Chassis updated successfully',
//         data: chassis
//     });
// });


exports.updateChassis = asyncHandler(async (req, res) => {
    const chassis = await Chassis.findById(req.params.id);
    if (!chassis) throw new ApiError('Chassis not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        chassis[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...chassis.images];

        // Update with new images
        chassis.images = req.files.map(file => file.location);

        // Save the document (only once)
        await chassis.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await chassis.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Chassis updated successfully',
        data: chassis
    });
});

// @desc    Delete a chassis
// @route   DELETE /api/v1/chassis/:id
// @access  Private
exports.deleteChassis = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    // First verify the chassis exists and belongs to the user
    const chassis = await Chassis.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!chassis) {
        throw new ApiError('Chassis not found or access denied', 404);
    }

    // Remove chassis reference from RV (maintaining existing logic)
    await RV.updateOne(
        { chassis: chassis._id },
        { $unset: { chassis: "" } }
    );

    // Delete the chassis
    await Chassis.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: 'Chassis deleted successfully',
        data: {}
    });
});
