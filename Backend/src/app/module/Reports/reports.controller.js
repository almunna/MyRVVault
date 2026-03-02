const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const QueryBuilder = require('../../../builder/queryBuilder');
const deleteDocumentWithFiles = require('../../../utils/deleteDocumentWithImages');
const getSelectedRvByUserId = require('../../../utils/currentRv');
const checkValidRv = require('../../../utils/checkValidRv');
const deleteS3Objects = require('../../../utils/deleteS3ObjectsImage');

const col = () => db.collection('reports');

exports.createReport = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);
    let rvId = req.body.rvId;

    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    const hasAccess = await checkValidRv(userId, rvId);
    if (!hasAccess) throw new ApiError('You do not have permission to add reports for this RV', 403);

    const data = {
        ...req.body,
        rvId,
        user: userId,
        status: req.body.status || 'pending',
        isFavorite: false,
        images: req.files?.map(f => f.location) || [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const snap = await ref.get();
    const report = docToObj(snap);

    res.status(201).json({ success: true, message: 'Report created successfully', data: report });
});


exports.getReports = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const selectedRvId = await getSelectedRvByUserId(userId);

    let { rvId, from, to, searchTerm, sort, page = 1, limit = 10, component, expenseType } = req.query;
    if (!rvId && !selectedRvId) throw new ApiError('No selected RV found', 404);
    if (!rvId) rvId = selectedRvId;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build Firestore query with equality filters
    let query = col().where('user', '==', userId).where('rvId', '==', rvId);
    if (component) query = query.where('component', '==', component);
    if (expenseType) query = query.where('expenseType', '==', expenseType);

    // Apply sort
    const sortField = sort ? sort.replace('-', '') : 'createdAt';
    const sortDir = sort && sort.startsWith('-') ? 'desc' : sort ? 'asc' : 'desc';
    query = query.orderBy(sortField, sortDir);

    const snap = await query.get();
    let docs = queryToArr(snap);

    // Date range filter (JS-side)
    if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        docs = docs.filter(d => {
            if (!d.dateOfService) return false;
            const ds = new Date(d.dateOfService);
            return ds >= fromDate && ds <= toDate;
        });
    }

    // Search filter (JS-side)
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        docs = docs.filter(d => d.reportTitle && d.reportTitle.toLowerCase().includes(term));
    }

    // Cumulative cost (JS-side sum)
    const cumulativeCost = docs.reduce((sum, d) => sum + (Number(d.cost) || 0), 0);

    const total = docs.length;
    const paginated = docs.slice(skip, skip + limit);

    if (!paginated.length) {
        return res.status(200).json({
            success: true,
            message: 'No reports found',
            meta: { page, limit, total: 0, totalPage: 0, cumulativeCost: 0 },
            data: []
        });
    }

    res.status(200).json({
        success: true,
        message: 'Reports retrieved successfully',
        meta: { page, limit, total, totalPage: Math.ceil(total / limit), cumulativeCost },
        data: paginated
    });
});


exports.getReportById = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Report not found or access denied', 404);

    const report = docToObj(snap);
    if (report.user !== userId) throw new ApiError('Report not found or access denied', 404);

    res.status(200).json({ success: true, message: 'Report retrieved successfully', data: report });
});


exports.updateReport = asyncHandler(async (req, res) => {
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Report not found', 404);

    const report = docToObj(snap);
    const updates = { ...req.body, updatedAt: FieldValue.serverTimestamp() };

    if (req.files?.length > 0) {
        const oldImages = report.images || [];
        updates.images = req.files.map(f => f.location);
        await col().doc(req.params.id).update(updates);
        await deleteS3Objects(oldImages);
    } else {
        await col().doc(req.params.id).update(updates);
    }

    const updated = docToObj(await col().doc(req.params.id).get());
    return res.status(200).json({ success: true, message: 'Report updated successfully', report: updated });
});


exports.deleteReport = asyncHandler(async (req, res) => {
    const deleted = await deleteDocumentWithFiles('reports', req.params.id);
    if (!deleted) throw new ApiError('Report not found', 404);

    return res.status(200).json({ success: true, message: 'Report deleted successfully', data: deleted });
});


exports.toggleFavoriteReport = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Report not found', 404);

    const report = docToObj(snap);
    if (report.user !== userId) throw new ApiError('Report not found', 404);

    const newFavorite = !report.isFavorite;
    await col().doc(req.params.id).update({ isFavorite: newFavorite, updatedAt: FieldValue.serverTimestamp() });

    const updated = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({
        success: true,
        message: newFavorite ? 'Report added to favorites' : 'Report removed from favorites',
        data: updated
    });
});


exports.getFavoriteReports = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const colRef = col().where('user', '==', userId).where('isFavorite', '==', true);
    const result = await new QueryBuilder(colRef, req.query).search(['reportTitle']).sort().paginate().execute();

    res.status(200).json({
        success: true,
        message: 'Favorite reports retrieved successfully',
        meta: result.meta,
        data: result.data
    });
});
