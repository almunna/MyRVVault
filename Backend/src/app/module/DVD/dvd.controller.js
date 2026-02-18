const Dvd = require('./Dvd');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv')
const deleteFile = require('../../../utils/unlinkFile');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

const uploadPath = path.join(__dirname, '../uploads');

exports.createDvd = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    const dvd = await Dvd.create({
        rvId,
        ...req.body,
        user: userId,
    });
    const images = req.files;
    if (!dvd) throw new ApiError('DVD not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        dvd.images = imagePaths;
        await dvd.save();
    }

    res.status(201).json({
        success: true,
        message: 'DVD created successfully',
        dvd
    });
});

exports.getDvd = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const dvdsQuery = new QueryBuilder(
        Dvd.find(baseQuery),
        req.query
    )
    
    const dvds = await dvdsQuery
        .search(['name', 'modelNumber'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Dvd.find(baseQuery),
        req.query
    ).countTotal();

    if (!dvds || dvds.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No DVDs found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'DVD retrieved successfully',
        meta,
        data: dvds
    });
});

exports.getDvdById = asyncHandler(async (req, res) => {
    const dvd = await Dvd.findById(req.params.id);
    if (!dvd) throw new ApiError('Dvd not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Dvd retrieved successfully',
        data: dvd
    });
});

// exports.updateDvd = asyncHandler(async (req, res) => {
//     const dvd = await Dvd.findById(req.params.id);
//     if (!dvd) throw new ApiError('Dvd not found', 404);

//     // Update dvd fields from req.body
//     Object.keys(req.body).forEach(key => {
//         dvd[key] = req.body[key];
//     });

//     await dvd.save();

//     if (req.files && req.files.length > 0) {
//         // For S3, we don't need to delete old files manually as they're managed by AWS
//         // Just replace with new images
//         const newImages = req.files.map(image => image.location);
//         dvd.images = newImages;
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Dvd updated successfully',
//         dvd
//     });
// });

exports.updateDvd = asyncHandler(async (req, res) => {
    const dvd = await Dvd.findById(req.params.id);
    if (!dvd) throw new ApiError('Dvd not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        dvd[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...dvd.images];
        
        // Update with new images
        dvd.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await dvd.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await dvd.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Dvd updated successfully',
        dvd
    });
});

exports.deleteDvd = asyncHandler(async (req, res) => {
    const dvd = await deleteDocumentWithFiles(Dvd, req.params.id, "uploads");
    if (!dvd) throw new ApiError("DVD not found", 404);

    return res.status(200).json({
        success: true,
        message: "DVD deleted successfully",
        dvd,
    });
});