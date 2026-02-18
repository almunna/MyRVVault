const Heater = require('./Heater');
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

exports.createHeater = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    
    const heater = await Heater.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!heater) throw new ApiError('Heater not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        heater.images = imagePaths;
        await heater.save();
    }

    res.status(201).json({
        success: true,
        message: 'Heater created successfully',
        heater
    });
});

exports.getHeaters = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const heatersQuery = new QueryBuilder(
        Heater.find(baseQuery),
        req.query
    )
    
    const heaters = await heatersQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Heater.find(baseQuery),
        req.query
    ).countTotal();

    if (!heaters || heaters.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No heaters found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Heaters retrieved successfully',
        meta,
        data: heaters
    });
});

exports.getHeaterById = asyncHandler(async (req, res) => {
    const heater = await Heater.findById(req.params.id);
    if (!heater) throw new ApiError('Heater not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Heater retrieved successfully',
        data: heater
    });
});

// exports.updateHeater = asyncHandler(async (req, res) => {
//     const heater = await Heater.findById(req.params.id);
//     if (!heater) throw new ApiError('Heater not found', 404);

//     // Update heater fields from req.body
//     Object.keys(req.body).forEach(key => {
//         heater[key] = req.body[key];
//     });

//     await heater.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = heater.images;

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
//         heater.images = newImages;
//         await heater.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Heater updated successfully',
//         heater
//     });
// });

exports.updateHeater = asyncHandler(async (req, res) => {
    const heater = await Heater.findById(req.params.id);
    if (!heater) throw new ApiError('Heater not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        heater[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...heater.images];
        
        // Update with new images
        heater.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await heater.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await heater.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Heater updated successfully',
        heater
    });
});


exports.deleteHeater = asyncHandler(async (req, res) => {
    const heater = await deleteDocumentWithFiles(Heater, req.params.id, "uploads");
    if (!heater) throw new ApiError("Heater not found", 404);

    return res.status(200).json({
        success: true,
        message: "Heater deleted successfully (with images)",
        heater,
    });
});
