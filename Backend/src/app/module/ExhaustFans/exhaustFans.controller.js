const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const ExhaustFans = require('./ExhaustFans');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const deleteFile = require('../../../utils/unlinkFile');
const checkValidRv = require('../../../utils/checkValidRv');
const uploadPath = path.join(__dirname, '../uploads');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createExhaustFans = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    
    const exhaustFans = await ExhaustFans.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!exhaustFans) throw new ApiError('ExhaustFans not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        exhaustFans.images = imagePaths;
        await exhaustFans.save();
    }

    res.status(201).json({
        success: true,
        message: 'ExhaustFans created successfully',
        exhaustFans
    });
});

exports.getExhaustFans = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const exhaustFansQuery = new QueryBuilder(
        ExhaustFans.find(baseQuery),
        req.query
    )
    
    const exhaustFansList = await exhaustFansQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        ExhaustFans.find(baseQuery),
        req.query
    ).countTotal();

    if (!exhaustFansList || exhaustFansList.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No ExhaustFans found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'ExhaustFans retrieved successfully',
        meta,
        data: exhaustFansList
    });
});

exports.getExhaustFansById = asyncHandler(async (req, res) => {
    const exhaustFans = await ExhaustFans.findById(req.params.id);
    if (!exhaustFans) throw new ApiError('ExhaustFans not found', 404);
    return res.status(200).json({
        success: true,
        message: 'ExhaustFans retrieved successfully',
        data: exhaustFans
    });
});

// exports.updateExhaustFans = asyncHandler(async (req, res) => {
//     const exhaustFans = await ExhaustFans.findById(req.params.id);
//     if (!exhaustFans) throw new ApiError('ExhaustFans not found', 404);

//     // Update exhaustFans fields from req.body
//     Object.keys(req.body).forEach(key => {
//         exhaustFans[key] = req.body[key];
//     });

//     await exhaustFans.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = exhaustFans.images;

//         // Delete old images from disk
//         oldImages.forEach(image => {
//             const path = image.split('/').pop();
//             try {
//                 fs.unlinkSync(`${uploadPath}/${path}`);
//             } catch (err) {
//                 if (err.code !== 'ENOENT') {
//                     console.error(err);
//                 }
//             }
//         });

//         // Set only new images
//         const newImages = req.files.map(image => image.location);
//         exhaustFans.images = newImages;
//         await exhaustFans.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'ExhaustFans updated successfully',
//         exhaustFans
//     });
// });

exports.updateExhaustFans = asyncHandler(async (req, res) => {
    const exhaustFans = await ExhaustFans.findById(req.params.id);
    if (!exhaustFans) throw new ApiError('ExhaustFans not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        exhaustFans[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...exhaustFans.images];
        
        // Update with new images
        exhaustFans.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await exhaustFans.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await exhaustFans.save();
    }

    return res.status(200).json({
        success: true,
        message: 'ExhaustFans updated successfully',
        exhaustFans
    });
});

exports.deleteExhaustFans = asyncHandler(async (req, res) => {
    const exhaustFans = await deleteDocumentWithFiles(ExhaustFans, req.params.id, "uploads");
    if (!exhaustFans) throw new ApiError("ExhaustFans not found", 404);

    return res.status(200).json({
        success: true,
        message: "ExhaustFans deleted successfully (with images)",
        exhaustFans,
    });
});