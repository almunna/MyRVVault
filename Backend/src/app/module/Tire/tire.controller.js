const Tire = require('./Tire');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv')
const deleteFile = require('../../../utils/unlinkFile');
const uploadPath = path.join(__dirname, '../uploads');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');



exports.createTire = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    const tire = await Tire.create({
        rvId,
        ...req.body,
        user: userId,
    });
    const images = req.files;
    if (!tire) throw new ApiError('Tire not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        tire.images = imagePaths;
        await tire.save();
    }

    res.status(201).json({
        success: true,
        message: 'Tire created successfully',
        tire
    });
});


exports.getTire = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const tiresQuery = new QueryBuilder(
        Tire.find(baseQuery),
        req.query
    )
    
    const tires = await tiresQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Tire.find(baseQuery),
        req.query
    ).countTotal();

    if (!tires || tires.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No tires found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Tire retrieved successfully',
        meta,
        data: tires
    });
});

exports.getTireById = asyncHandler(async (req, res) => {
    const tire = await Tire.findById(req.params.id);
    if (!tire) throw new ApiError('Tire not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Tire retrieved successfully',
        data: tire
    });
});

// exports.updateTire = asyncHandler(async (req, res) => {
//     const tire = await Tire.findById(req.params.id);
//     if (!tire) throw new ApiError('Tire not found', 404);

//     // 1. Update fields from req.body
//     Object.keys(req.body).forEach(key => {
//         tire[key] = req.body[key];
//     });

//     await tire.save();

//     // if (req.files && req.files.length > 0) {
//     //     const oldImages = tire.images;
//     //     const newImages = req.files.map(image => image.path.replace('upload/', ''));
//     //     tire.images = [...oldImages, ...newImages];
//     //     await tire.save();

//     //     oldImages.forEach(image => {
//     //         const path = image.split('/').pop();
//     //         try {
//     //             fs.unlinkSync(`${uploadPath}/${path}`);
//     //         } catch (err) {
//     //             if (err.code !== 'ENOENT') {
//     //                 console.error(err);
//     //             }
//     //         }
//     //     });
//     // }

//     if (req.files && req.files.length > 0) {
//         const oldImages = tire.images;

//         // 2. Handle file uploads if any
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
//         tire.images = newImages;
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Tire updated successfully',
//         tire
//     });
// });

exports.updateTire = asyncHandler(async (req, res) => {
    const tire = await Tire.findById(req.params.id);
    if (!tire) throw new ApiError('Tire not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        tire[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...tire.images];
        
        // Update with new images
        tire.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await tire.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await   tire.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Tire updated successfully',
        tire
    });
});


exports.deleteTire = asyncHandler(async (req, res) => {
    const tire = await deleteDocumentWithFiles(Tire, req.params.id, "uploads");
    if (!tire) throw new ApiError("tire not found", 404);

    return res.status(200).json({
        success: true,
        message: "tire deleted successfully (with images)",
        tire,
    });
});

