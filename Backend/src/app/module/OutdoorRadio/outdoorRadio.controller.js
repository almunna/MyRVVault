const OutdoorRadio = require('./OutdoorRadio');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createOutdoorRadio = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    
    const outdoorRadio = await OutdoorRadio.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!outdoorRadio) throw new ApiError('OutdoorRadio not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        outdoorRadio.images = imagePaths;
        await outdoorRadio.save();
    }

    res.status(201).json({
        success: true,
        message: 'OutdoorRadio created successfully',
        outdoorRadio
    });
});

exports.getOutdoorRadio = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };
    
    const outdoorRadioQuery = new QueryBuilder(
        OutdoorRadio.find(baseQuery),
        { ...req.query, sort: req.query.sort || 'name' }
    )
    
    const outdoorRadios = await outdoorRadioQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        OutdoorRadio.find(baseQuery),
        { ...req.query, sort: req.query.sort || 'name' }
    ).countTotal();

    if (!outdoorRadios || outdoorRadios.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No outdoorRadios found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'OutdoorRadios retrieved successfully',
        meta,
        data: outdoorRadios
    });
});

exports.getOutdoorRadioById = asyncHandler(async (req, res) => {
    const outdoorRadio = await OutdoorRadio.findById(req.params.id);
    if (!outdoorRadio) throw new ApiError('OutdoorRadio not found', 404);
    return res.status(200).json({
        success: true,
        message: 'OutdoorRadio retrieved successfully',
        data: outdoorRadio
    });
});

// exports.updateOutdoorRadio = asyncHandler(async (req, res) => {
//     const outdoorRadio = await OutdoorRadio.findById(req.params.id);
//     if (!outdoorRadio) throw new ApiError('OutdoorRadio not found', 404);

//     // Update outdoorRadio fields from req.body
//     Object.keys(req.body).forEach(key => {
//         outdoorRadio[key] = req.body[key];
//     });

//     await outdoorRadio.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = outdoorRadio.images;

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
//         outdoorRadio.images = newImages;
//         await outdoorRadio.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'OutdoorRadio updated successfully',
//         outdoorRadio
//     });
// });

exports.updateOutdoorRadio = asyncHandler(async (req, res) => {
    const outdoorRadio = await OutdoorRadio.findById(req.params.id);
    if (!outdoorRadio) throw new ApiError('OutdoorRadio not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        outdoorRadio[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...outdoorRadio.images];
        
        // Update with new images
        outdoorRadio.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await outdoorRadio.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await outdoorRadio.save();
    }

    return res.status(200).json({
        success: true,
        message: 'OutdoorRadio updated successfully',
        outdoorRadio
    });
});


exports.deleteOutdoorRadio = asyncHandler(async (req, res) => {
    const outdoorRadio = await deleteDocumentWithFiles(OutdoorRadio, req.params.id, "uploads");
    if (!outdoorRadio) throw new ApiError("OutdoorRadio not found", 404);

    return res.status(200).json({
        success: true,
        message: "OutdoorRadio deleted successfully (with images)",
        outdoorRadio,
    });
});