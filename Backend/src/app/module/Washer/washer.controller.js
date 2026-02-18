const Washer = require('./Washer');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv')
const deleteFile = require('../../../utils/unlinkFile');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

const uploadPath = path.join(__dirname, '../uploads');

exports.createWasher = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    const washer = await Washer.create({
        rvId,
        ...req.body,
        user: userId,
    });
    const images = req.files;
    if (!washer) throw new ApiError('Washer not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        washer.images = imagePaths;
        await washer.save();
    }

    res.status(201).json({
        success: true,
        message: 'Washer created successfully',
        washer
    });
});


exports.getWasher = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const washersQuery = new QueryBuilder(
        Washer.find(baseQuery),
        req.query
    )
    
    const washers = await washersQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Washer.find(baseQuery),
        req.query
    ).countTotal();

    if (!washers || washers.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No washers found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Washer retrieved successfully',
        meta,
        data: washers
    });
});


exports.getWasherById = asyncHandler(async (req, res) => {
    const washer = await Washer.findById(req.params.id);
    if (!washer) throw new ApiError('Washer not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Washer retrieved successfully',
        data: washer
    });
});



// exports.updateWasher = asyncHandler(async (req, res) => {
//     const washer = await Washer.findById(req.params.id);
//     if (!washer) throw new ApiError('Washer not found', 404);


//     // Update washer fields from req.body
//     Object.keys(req.body).forEach(key => {
//         washer[key] = req.body[key];
//     });

//     await washer.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = washer.images;

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
//         washer.images = newImages;
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Washer updated successfully',
//         washer
//     });
// });

exports.updateWasher = asyncHandler(async (req, res) => {
    const washer = await Washer.findById(req.params.id);
    if (!washer) throw new ApiError('Washer not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        washer[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...washer.images];
        
        // Update with new images
        washer.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await washer.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await   washer.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Washer updated successfully',
        washer
    });
});


exports.deleteWasher = asyncHandler(async (req, res) => {
    const washer = await deleteDocumentWithFiles(Washer, req.params.id, "uploads");
    if (!washer) throw new ApiError("washer not found", 404);

    return res.status(200).json({
        success: true,
        message: "washer deleted successfully (with images)",
        washer,
    });
});
