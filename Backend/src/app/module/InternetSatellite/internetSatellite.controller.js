const InternetSatellite = require('./InternetSatellite');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const deleteFile = require('../../../utils/unlinkFile');
const checkValidRv = require('../../../utils/checkValidRv');
const uploadPath = path.join(__dirname, '../uploads');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createInternetSatellite = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    
    const internetSatellite = await InternetSatellite.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!internetSatellite) throw new ApiError('Internet satellite device not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        internetSatellite.images = imagePaths;
        await internetSatellite.save();
    }

    res.status(201).json({
        success: true,
        message: 'Internet satellite device created successfully',
        internetSatellite
    });
});

exports.getInternetSatellites = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };

    const internetSatellitesQuery = new QueryBuilder(
        InternetSatellite.find(baseQuery),
        req.query
    )
    
    const internetSatellites = await internetSatellitesQuery
        .search(['name', 'brand', 'modelNumber'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        InternetSatellite.find(baseQuery),
        req.query
    ).countTotal();

    if (!internetSatellites || internetSatellites.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No internet satellite devices found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Internet satellite devices retrieved successfully',
        meta,
        data: internetSatellites
    });
});

exports.getInternetSatelliteById = asyncHandler(async (req, res) => {
    const internetSatellite = await InternetSatellite.findById(req.params.id);
    if (!internetSatellite) return res.status(200).json({
        success: true,
        message: 'Internet satellite device not found',
        data: internetSatellite
    });
    return res.status(200).json({
        success: true,
        message: 'Internet satellite device retrieved successfully',
        internetSatellite
    });
});

// exports.updateInternetSatellite = asyncHandler(async (req, res) => {
//     const internetSatellite = await InternetSatellite.findById(req.params.id);
//     if (!internetSatellite) throw new ApiError('Internet satellite device not found', 404);

//     // Update internet satellite device fields from req.body
//     Object.keys(req.body).forEach(key => {
//         internetSatellite[key] = req.body[key];
//     });

//     await internetSatellite.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = internetSatellite.images;

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
//         internetSatellite.images = newImages;
//         await internetSatellite.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Internet satellite device updated successfully',
//         internetSatellite
//     });
// });


exports.updateInternetSatellite = asyncHandler(async (req, res) => {
    const internetSatellite = await InternetSatellite.findById(req.params.id);
    if (!internetSatellite) throw new ApiError('Internet satellite device not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        internetSatellite[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...internetSatellite.images];
        
        // Update with new images
        internetSatellite.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await internetSatellite.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await internetSatellite.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Internet satellite device updated successfully',
        internetSatellite
    });
});


exports.deleteInternetSatellite = asyncHandler(async (req, res) => {
    const internetSatellite = await deleteDocumentWithFiles(InternetSatellite, req.params.id, "uploads");
    if (!internetSatellite) throw new ApiError("Internet satellite device not found", 404);

    return res.status(200).json({
        success: true,
        message: "Internet satellite device deleted successfully (with images)",
        internetSatellite,
    });
});
