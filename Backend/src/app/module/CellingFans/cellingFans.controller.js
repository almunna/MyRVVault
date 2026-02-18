const CellingFans = require('./CellingFans');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const deleteFile = require('../../../utils/unlinkFile');
const uploadPath = path.join(__dirname, '../uploads');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createCellingFans = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    
    const cellingFans = await CellingFans.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!cellingFans) throw new ApiError('CellingFans not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        cellingFans.images = imagePaths;
        await cellingFans.save();
    }

    res.status(201).json({
        success: true,
        message: 'CellingFans created successfully',
        cellingFans
    });
});

exports.getCellingFans = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const cellingFansQuery = new QueryBuilder(
        CellingFans.find(baseQuery),
        req.query
    )
    
    const cellingFans = await cellingFansQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        CellingFans.find(baseQuery),
        req.query
    ).countTotal();

    if (!cellingFans || cellingFans.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No cellingFans found',
            meta,
            data:cellingFans
        });
    }

    return res.status(200).json({
        success: true,
        message: 'CellingFans retrieved successfully',
        meta,
        data: cellingFans
    });
});

exports.getCellingFansById = asyncHandler(async (req, res) => {
    const cellingFans = await CellingFans.findById(req.params.id);
    if (!cellingFans) throw new ApiError('CellingFans not found', 404);
    return res.status(200).json({
        success: true,
        message: 'CellingFans retrieved successfully',
        data: cellingFans
    });
});

// exports.updateCellingFans = asyncHandler(async (req, res) => {
//     const cellingFans = await CellingFans.findById(req.params.id);
//     if (!cellingFans) throw new ApiError('CellingFans not found', 404);

//     // Update cellingFans fields from req.body
//     Object.keys(req.body).forEach(key => {
//         cellingFans[key] = req.body[key];
//     });

//     await cellingFans.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = cellingFans.images;

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
//         cellingFans.images = newImages;
//         await cellingFans.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'CellingFans updated successfully',
//         cellingFans
//     });
// });


exports.updateCellingFans = asyncHandler(async (req, res) => {
    const cellingFans = await CellingFans.findById(req.params.id);
    if (!cellingFans) throw new ApiError('CellingFans not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        cellingFans[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...cellingFans.images];
        
        // Update with new images
        cellingFans.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await cellingFans.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await cellingFans.save();
    }

    return res.status(200).json({
        success: true,
        message: 'CellingFans updated successfully',
        cellingFans
    });
});

exports.deleteCellingFans = asyncHandler(async (req, res) => {
    const cellingFans = await deleteDocumentWithFiles(CellingFans, req.params.id, "uploads");
    if (!cellingFans) throw new ApiError("CellingFans not found", 404);

    return res.status(200).json({
        success: true,
        message: "CellingFans deleted successfully (with images)",
        cellingFans,
    });
});
