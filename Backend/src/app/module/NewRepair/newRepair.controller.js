const NewRepair = require('./NewRepair');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createNewRepair = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;

    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add repairs for this RV', 403);
    }

    const newRepair = await NewRepair.create({
        rvId,
        ...req.body,
        user: userId,
        status: 'pending' // Default status
    });

    const images = req.files;
    if (!newRepair) throw new ApiError('Repair request not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        newRepair.images = imagePaths;
        await newRepair.save();
    }

    res.status(201).json({
        success: true,
        message: 'Repair request created successfully',
        data: newRepair
    });
});

exports.getNewRepairs = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;

    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const baseQuery = { user: userId, rvId };

    const newRepairQuery = new QueryBuilder(
        NewRepair.find(baseQuery),
        req.query
    );

    const newRepairs = await newRepairQuery
        .search(['cost', 'qty', 'component', 'expenseType'])
        .filter({
            component: req.query.component,
            expenseType: req.query.expenseType,
        })
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        NewRepair.find(baseQuery),
        req.query
    ).countTotal();

    if (!newRepairs || newRepairs.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No repair requests found',
            meta,
            data: []
        });
    }

    res.status(200).json({
        success: true,
        message: 'Repair requests retrieved successfully',
        meta,
        data: newRepairs
    });
});

exports.getNewRepairById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const newRepair = await NewRepair.findOne({
        _id: req.params.id,
        user: userId
    });

    if (!newRepair) {
        throw new ApiError('Repair request not found or access denied', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Repair request retrieved successfully',
        data: newRepair
    });
});

// exports.updateNewRepair = asyncHandler(async (req, res) => {
//     const userId = req.user.id || req.user._id;

//     const newRepair = await NewRepair.findOne({
//         _id: req.params.id,
//         user: userId
//     });

//     if (!newRepair) {
//         throw new ApiError('Repair request not found or access denied', 404);
//     }

//     // Update repair fields from req.body
//     Object.keys(req.body).forEach(key => {
//         if (key !== 'images') { // Don't override images from req.body
//             newRepair[key] = req.body[key];
//         }
//     });

//     // Handle image updates if new files are uploaded
//     if (req.files && req.files.length > 0) {
//         // Keep existing images and add new ones
//         const newImages = req.files.map(file => file.location);
//         newRepair.images = [...(newRepair.images || []), ...newImages];
//     }

//     await newRepair.save();

//     res.status(200).json({
//         success: true,
//         message: 'Repair request updated successfully',
//         data: newRepair
//     });
// });

exports.updateNewRepair = asyncHandler(async (req, res) => {
    const newRepair = await NewRepair.findById(req.params.id);
    if (!newRepair) throw new ApiError('Repair request not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        newRepair[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...newRepair.images];

        // Update with new images
        newRepair.images = req.files.map(file => file.location);

        // Save the document (only once)
        await newRepair.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await newRepair.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Repair request updated successfully',
        data: newRepair
    });
});

exports.deleteNewRepair = asyncHandler(async (req, res) => {
    const newRepair = await deleteDocumentWithFiles(NewRepair, req.params.id, "uploads");
    if (!newRepair) throw new ApiError("Repair request not found", 404);

    return res.status(200).json({
        success: true,
        message: "Repair request deleted successfully",
        data: newRepair
    });
});
