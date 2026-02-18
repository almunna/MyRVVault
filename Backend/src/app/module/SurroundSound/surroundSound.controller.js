const SurroundSound = require('./SurroundSound');
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

exports.createSurroundSound = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const surroundSound = await SurroundSound.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!surroundSound) throw new ApiError('Surround sound system not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        surroundSound.images = imagePaths;
        await surroundSound.save();
    }

    res.status(201).json({
        success: true,
        message: 'Surround sound system created successfully',
        surroundSound
    });
});

exports.getSurroundSounds = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };

    const surroundSoundsQuery = new QueryBuilder(
        SurroundSound.find(baseQuery),
        req.query
    )
    
    const surroundSounds = await surroundSoundsQuery
        .search(['name', 'brand', 'modelNumber'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        SurroundSound.find(baseQuery),
        req.query
    ).countTotal();

    if (!surroundSounds || surroundSounds.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No surround sound systems found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Surround sound systems retrieved successfully',
        meta,
        data: surroundSounds
    });
});

exports.getSurroundSoundById = asyncHandler(async (req, res) => {
    const surroundSound = await SurroundSound.findById(req.params.id);
    if (!surroundSound) throw new ApiError('Surround sound system not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Surround sound system retrieved successfully',
        data: surroundSound
    });
});

// exports.updateSurroundSound = asyncHandler(async (req, res) => {
//     const surroundSound = await SurroundSound.findById(req.params.id);
//     if (!surroundSound) throw new ApiError('Surround sound system not found', 404);

//     // Update surround sound system fields from req.body
//     Object.keys(req.body).forEach(key => {
//         surroundSound[key] = req.body[key];
//     });

//     await surroundSound.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = surroundSound.images;

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
//         surroundSound.images = newImages;
//         await surroundSound.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Surround sound system updated successfully',
//         surroundSound
//     });
// });

exports.updateSurroundSound = asyncHandler(async (req, res) => {
    const surroundSound = await SurroundSound.findById(req.params.id);
    if (!surroundSound) throw new ApiError('Surround sound system not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        surroundSound[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...surroundSound.images];
        
        // Update with new images
        surroundSound.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await surroundSound.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await surroundSound.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Surround sound system updated successfully',
        surroundSound
    });
});


exports.deleteSurroundSound = asyncHandler(async (req, res) => {
    const surroundSound = await deleteDocumentWithFiles(SurroundSound, req.params.id, "uploads");
    if (!surroundSound) throw new ApiError("Surround sound system not found", 404);

    return res.status(200).json({
        success: true,
        message: "Surround sound system deleted successfully (with images)",
        surroundSound,
    });
});