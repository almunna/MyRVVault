const Dryer = require('./Dryer');
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

exports.createDryer = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;


    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) {
        throw new ApiError('You do not have permission to add maintenance for this RV', 403);
    }
    
    const dryer = await Dryer.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!dryer) throw new ApiError('Dryer not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        dryer.images = imagePaths;
        await dryer.save();
    }

    res.status(201).json({
        success: true,
        message: 'Dryer created successfully',
        dryer
    });
});

exports.getDryers = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const dryersQuery = new QueryBuilder(
        Dryer.find(baseQuery),
        req.query
    )
    
    const dryers = await dryersQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Dryer.find(baseQuery),
        req.query
    ).countTotal();

    if (!dryers || dryers.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No Dryers found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Dryers retrieved successfully',
        meta,
        data: dryers
    });
});

exports.getDryerById = asyncHandler(async (req, res) => {
    const dryer = await Dryer.findById(req.params.id);
    if (!dryer) throw new ApiError('Dryer not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Dryer retrieved successfully',
        data: dryer
    });
});

// exports.updateDryer = asyncHandler(async (req, res) => {
//     const dryer = await Dryer.findById(req.params.id);
//     if (!dryer) throw new ApiError('Dryer not found', 404);

//     // Update dryer fields from req.body
//     Object.keys(req.body).forEach(key => {
//         dryer[key] = req.body[key];
//     });

//     await dryer.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = dryer.images;

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
//         dryer.images = newImages;
//         await dryer.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Dryer updated successfully',
//         dryer
//     });
// });

exports.updateDryer = asyncHandler(async (req, res) => {
    const dryer = await Dryer.findById(req.params.id);
    if (!dryer) throw new ApiError('Dryer not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        dryer[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...dryer.images];
        
        // Update with new images
        dryer.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await dryer.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await dryer.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Dryer updated successfully',
        dryer
    });
});

exports.deleteDryer = asyncHandler(async (req, res) => {
    const dryer = await deleteDocumentWithFiles(Dryer, req.params.id, "uploads");
    if (!dryer) throw new ApiError("Dryer not found", 404);

    return res.status(200).json({
        success: true,
        message: "Dryer deleted successfully (with images)",
        dryer,
    });
});