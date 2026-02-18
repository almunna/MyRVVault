const VentFans = require('./VentFans');
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

exports.createVentFans = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const ventFans = await VentFans.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!ventFans) throw new ApiError('Vent fan not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        ventFans.images = imagePaths;
        await ventFans.save();
    }

    res.status(201).json({
        success: true,
        message: 'Vent fan created successfully',
        ventFans
    });
});

exports.getVentFans = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };

    const ventFansQuery = new QueryBuilder(
        VentFans.find(baseQuery),
        req.query
    )
    
    const ventFans = await ventFansQuery
        .search(['name', 'brand', 'modelNumber'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        VentFans.find(baseQuery),
        req.query
    ).countTotal();

    if (!ventFans || ventFans.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No vent fans found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Vent fans retrieved successfully',
        meta,
        data: ventFans
    });
});

exports.getVentFanById = asyncHandler(async (req, res) => {
    const ventFan = await VentFans.findById(req.params.id);
    if (!ventFan) throw new ApiError('Vent fan not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Vent fan retrieved successfully',
        data: ventFan
    });
});

// exports.updateVentFan = asyncHandler(async (req, res) => {
//     const ventFan = await VentFans.findById(req.params.id);
//     if (!ventFan) throw new ApiError('Vent fan not found', 404);

//     // Update vent fan fields from req.body
//     Object.keys(req.body).forEach(key => {
//         ventFan[key] = req.body[key];
//     });

//     await ventFan.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = ventFan.images;

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
//         ventFan.images = newImages;
//         await ventFan.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Vent fan updated successfully',
//         ventFan
//     });
// });

exports.updateVentFan = asyncHandler(async (req, res) => {
    const ventFan = await VentFans.findById(req.params.id);
    if (!ventFan) throw new ApiError('Vent fan not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        ventFan[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...ventFan.images];
        
        // Update with new images
        ventFan.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await ventFan.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await   ventFan.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Vent fan updated successfully',
        ventFan
    });
});


exports.deleteVentFan = asyncHandler(async (req, res) => {
    const ventFan = await deleteDocumentWithFiles(VentFans, req.params.id, "uploads");
    if (!ventFan) throw new ApiError("Vent fan not found", 404);

    return res.status(200).json({
        success: true,
        message: "Vent fan deleted successfully (with images)",
        ventFan,
    });
});
