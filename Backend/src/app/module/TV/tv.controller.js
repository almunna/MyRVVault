const Tv = require('./Tv');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const deleteFile = require('../../../utils/unlinkFile');
const uploadPath = path.join(__dirname, '../uploads');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createTv = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const tv = await Tv.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!tv) throw new ApiError('TV not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        tv.images = imagePaths;
        await tv.save();
    }

    res.status(201).json({
        success: true,
        message: 'TV created successfully',
        tv
    });
});

exports.getTvs = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const tvsQuery = new QueryBuilder(
        Tv.find(baseQuery),
        req.query
    )
    
    const tvs = await tvsQuery
        .search(['name', 'brand', 'modelNumber'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Tv.find(baseQuery),
        req.query
    ).countTotal();

    if (!tvs || tvs.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No TVs found',
            meta,
            data: tvs
        });
    }

    return res.status(200).json({
        success: true,
        message: 'TVs retrieved successfully',
        meta,
        data: tvs
    });
});

exports.getTvById = asyncHandler(async (req, res) => {
    const tv = await Tv.findById(req.params.id);
    if (!tv) throw new ApiError('TV not found', 404);
    return res.status(200).json({
        success: true,
        message: 'TV retrieved successfully',
        data: tv
    });
});

// exports.updateTv = asyncHandler(async (req, res) => {
//     const tv = await Tv.findById(req.params.id);
//     if (!tv) throw new ApiError('TV not found', 404);

//     // Update TV fields from req.body
//     Object.keys(req.body).forEach(key => {
//         tv[key] = req.body[key];
//     });

//     await tv.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = tv.images;

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
//         tv.images = newImages;
//         await tv.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'TV updated successfully',
//         tv
//     });
// });

exports.updateTv = asyncHandler(async (req, res) => {
    const tv = await Tv.findById(req.params.id);
    if (!tv) throw new ApiError('TV not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        tv[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...tv.images];
        
        // Update with new images
        tv.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await tv.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await   tv.save();
    }

    return res.status(200).json({
        success: true,
        message: 'TV updated successfully',
        tv
    });
});


exports.deleteTv = asyncHandler(async (req, res) => {
    const tv = await deleteDocumentWithFiles(Tv, req.params.id, "uploads");
    if (!tv) throw new ApiError("TV not found", 404);

    return res.status(200).json({
        success: true,
        message: "TV deleted successfully (with images)",
        tv,
    });
});