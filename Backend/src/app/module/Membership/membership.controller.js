const Membership = require('./Membership');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const fs = require('fs');
const path = require('path');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const deleteFile = require('../../../utils/unlinkFile');
const uploadPath = path.join(__dirname, '../uploads');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

exports.createMembership = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const selectedRvId = await getSelectedRvByUserId(userId);
  let rvId = req.body.rvId;
  if(!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
  if(!rvId) rvId = selectedRvId;

  const hasAccess = await checkValidRv(userId, rvId);
  if (!hasAccess) {
    throw new ApiError('You do not have permission to add membership for this RV', 403);
  }
  
  const membership = await Membership.create({
    rvId,
    ...req.body,
    user: userId,
  });
  
  const images = req.files;
  if (!membership) throw new ApiError('Membership not created', 500);

  if (images && images.length > 0) {
    const imagePaths = images.map(image => image.location);
    membership.images = imagePaths;
    await membership.save();
  }

  res.status(201).json({
    success: true,
    message: 'Membership created successfully',
    membership
  });
});

exports.getMemberships = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const selectedRvId = await getSelectedRvByUserId(userId);
  let rvId = req.query.rvId;
  if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
  if (!rvId) rvId = selectedRvId;

  const baseQuery = { user: userId, rvId };
  const query = { ...req.query };
  if (!query.sort) query.sort = 'name';

  const membershipsQuery = new QueryBuilder(Membership.find(baseQuery), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const memberships = await membershipsQuery.modelQuery;
  const meta = await membershipsQuery.countTotal();

  if (!memberships || memberships.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No memberships found',
      meta,
      data: []
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Memberships retrieved successfully',
    meta,
    data: memberships
  });
});

exports.getMembershipById = asyncHandler(async (req, res) => {
  const membership = await Membership.findById(req.params.id);
  if (!membership) throw new ApiError('Membership not found', 404);
  return res.status(200).json({
    success: true,
    message: 'Membership retrieved successfully',
    data: membership
  });
});

// exports.updateMembership = asyncHandler(async (req, res) => {
//   const membership = await Membership.findById(req.params.id);
//   if (!membership) throw new ApiError('Membership not found', 404);

//   // Update membership fields from req.body
//   Object.keys(req.body).forEach(key => {
//     membership[key] = req.body[key];
//   });

//   await membership.save();

//   if (req.files && req.files.length > 0) {
//     const oldImages = membership.images;

//     // Delete old images from disk
//     oldImages.forEach(image => {
//       const path = image.split('/').pop();
//       try {
//         fs.unlinkSync(`${uploadPath}/${path}`);
//       } catch (err) {
//         if (err.code !== 'ENOENT') {
//           console.error(err);
//         }
//       }
//     });

//     // Set only new images
//     const newImages = req.files.map(image => image.location);
//     membership.images = newImages;
//     await membership.save();
//   }

//   return res.status(200).json({
//     success: true,
//     message: 'Membership updated successfully',
//     membership
//   });
// });

exports.updateMembership = asyncHandler(async (req, res) => {
    const membership = await Membership.findById(req.params.id);
    if (!membership) throw new ApiError('Membership not found', 404);

    // 1. Update fields from req.body
    Object.keys(req.body).forEach(key => {
        membership[key] = req.body[key];
    });

    // 2. Handle file uploads if any
    if (req.files?.length > 0) {
        const oldImages = [...membership.images];
        
        // Update with new images
        membership.images = req.files.map(file => file.location);
        
        // Save the document (only once)
        await membership.save();

        // Delete old images from S3
        await deleteS3Objects(oldImages);
    } else {
        // If no files, just save the document
        await membership.save();
    }

    return res.status(200).json({
        success: true,
        message: 'Membership updated successfully',
        membership
    });
});

exports.deleteMembership = asyncHandler(async (req, res) => {
  const membership = await deleteDocumentWithFiles(Membership, req.params.id, "uploads");
  if (!membership) throw new ApiError("Membership not found", 404);

  return res.status(200).json({
    success: true,
    message: "Membership deleted successfully (with images)",
    membership,
  });
});