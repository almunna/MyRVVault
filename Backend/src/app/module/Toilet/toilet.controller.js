const Toilet = require('./Toilet');
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

exports.createToilet = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const toilet = await Toilet.create({
        rvId,
        ...req.body,
        user: userId,
    });
    
    const images = req.files;
    if (!toilet) throw new ApiError('Toilet not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        toilet.images = imagePaths;
        await toilet.save();
    }

    res.status(201).json({
        success: true,
        message: 'Toilet created successfully',
        toilet
    });
});

exports.getToilets = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const toiletsQuery = new QueryBuilder(
        Toilet.find(baseQuery),
        req.query
    )
    
    const toilets = await toiletsQuery
        .search(['name', 'brand'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        Toilet.find(baseQuery),
        req.query
    ).countTotal();

    if (!toilets || toilets.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No toilets found',
            meta,
            data: []
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Toilets retrieved successfully',
        meta,
        data: toilets
    });
});

exports.getToiletById = asyncHandler(async (req, res) => {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) throw new ApiError('Toilet not found', 404);
    return res.status(200).json({
        success: true,
        message: 'Toilet retrieved successfully',
        data: toilet
    });
});

// exports.updateToilet = asyncHandler(async (req, res) => {
//     const toilet = await Toilet.findById(req.params.id);
//     if (!toilet) throw new ApiError('Toilet not found', 404);

//     // Update toilet fields from req.body
//     Object.keys(req.body).forEach(key => {
//         toilet[key] = req.body[key];
//     });

//     await toilet.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = toilet.images;

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
//         toilet.images = newImages;
//         await toilet.save();
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'Toilet updated successfully',
//         toilet
//     });
// });

exports.updateToilet = asyncHandler(async (req, res) => {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) throw new ApiError('Toilet not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        toilet[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...toilet.images];
        
        // Update with new images
        toilet.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await toilet.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await   toilet.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Toilet updated successfully',
        toilet
    });
});


exports.deleteToilet = asyncHandler(async (req, res) => {
    const toilet = await deleteDocumentWithFiles(Toilet, req.params.id, "uploads");
    if (!toilet) throw new ApiError("Toilet not found", 404);

    return res.status(200).json({
        success: true,
        message: "Toilet deleted successfully (with images)",
        toilet,
    });
});
