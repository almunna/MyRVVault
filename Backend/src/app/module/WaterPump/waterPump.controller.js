const WaterPump = require('./WaterPump');
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

exports.createWaterPump = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    const waterPump = await WaterPump.create({
        rvId,
        ...req.body,
        user: userId,
    });
    const images = req.files;
    if (!waterPump) throw new ApiError('WaterPump not created', 500);

    if (images && images.length > 0) {
        const imagePaths = images.map(image => image.location);
        waterPump.images = imagePaths;
        await waterPump.save();
    }

    res.status(201).json({
        success: true,
        message: 'WaterPump created successfully',
        waterPump
    });
});

exports.getWaterPump = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.query.rvId;
    if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if(!rvId) rvId = selectedRvId;
    const baseQuery = { user: userId, rvId };
    const s = { ...req.query, ...baseQuery };

    const waterPumpQuery = new QueryBuilder(
        WaterPump.find(baseQuery),
        req.query
    )
    
    const waterPump = await waterPumpQuery
        .search(['name', 'modelNumber'])
        .filter()
        .sort()
        .paginate()
        .fields()
        .modelQuery;

    const meta = await new QueryBuilder(
        WaterPump.find(baseQuery),
        req.query
    ).countTotal();

    if (!waterPump || waterPump.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No water pumps found',
            meta,
            data: waterPump
        });
    }

    return res.status(200).json({
        success: true,
        message: 'WaterPump retrieved successfully',
        meta,
        data: waterPump
    });
});

exports.getWaterPumpById = asyncHandler(async (req, res) => {
    const waterPump = await WaterPump.findById(req.params.id);
    if (!waterPump) throw new ApiError('WaterPump not found', 404);
    return res.status(200).json({
        success: true,
        message: 'WaterPump retrieved successfully',
        data: waterPump
    });
});

// exports.updateWaterPump = asyncHandler(async (req, res) => {
//     const waterPump = await WaterPump.findById(req.params.id);
//     if (!waterPump) throw new ApiError('WaterPump not found', 404);

//     Object.keys(req.body).forEach(key => {
//         waterPump[key] = req.body[key];
//     });
//     await waterPump.save();

//     if (req.files && req.files.length > 0) {
//         const oldImages = waterPump.images;

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
//         waterPump.images = newImages;
//     }

//     return res.status(200).json({
//         success: true,
//         message: 'WaterPump updated successfully',
//         waterPump
//     });
// });

exports.updateWaterPump = asyncHandler(async (req, res) => {
    const waterPump = await WaterPump.findById(req.params.id);
    if (!waterPump) throw new ApiError('WaterPump not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        waterPump[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...waterPump.images];
        
        // Update with new images
        waterPump.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await waterPump.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await   waterPump.save();
    }

    return res.status(200).json({
        success: true,
        message: 'WaterPump updated successfully',
        waterPump
    });
});



exports.deleteWaterPump = asyncHandler(async (req, res) => {
  const waterPump = await deleteDocumentWithFiles(WaterPump, req.params.id, "uploads");
  if (!waterPump) throw new ApiError("WaterPump not found", 404);

  return res.status(200).json({
    success: true,
    message: "WaterPump deleted successfully (with images)",
    waterPump,
  });
});