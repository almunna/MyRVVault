const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const QueryBuilder = require('../../../builder/queryBuilder');

const col = () => db.collection('sellRvs');
const userCol = () => db.collection('users');


const addSellRv = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const data = {
        ...req.body,
        user: userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await col().add(data);
    const snap = await ref.get();
    const sellRv = docToObj(snap);

    // Add to user's sellRvIds
    await userCol().doc(userId).update({
        sellRvIds: FieldValue.arrayUnion(sellRv.id),
        updatedAt: FieldValue.serverTimestamp()
    });

    // Mark the selected RV as sold if provided
    if (req.body.selectedRvId) {
        await col().doc(req.body.selectedRvId).update({ isSold: true, updatedAt: FieldValue.serverTimestamp() });
    }

    res.status(201).json({ success: true, data: sellRv });
});


const getUserSellRvs = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const colRef = col().where('user', '==', userId);
    const result = await new QueryBuilder(colRef, req.query).filter().sort().paginate().execute();

    res.status(200).json({
        success: true,
        count: result.data.length,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        data: result.data
    });
});


const getSellRv = asyncHandler(async (req, res) => {
    const snap = await col().doc(req.params.id).get();
    const sellRv = snap.exists ? docToObj(snap) : null;
    res.status(200).json({ success: true, data: sellRv });
});


const updateSellRv = asyncHandler(async (req, res) => {
    await col().doc(req.params.id).update({ ...req.body, updatedAt: FieldValue.serverTimestamp() });
    const sellRv = docToObj(await col().doc(req.params.id).get());
    res.status(200).json({ success: true, data: sellRv });
});


const deleteSellRv = asyncHandler(async (req, res) => {
    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) return res.status(200).json({ success: true, data: null });

    const sellRv = docToObj(snap);
    await col().doc(req.params.id).delete();

    // Remove from all users' sellRvIds
    const usersSnap = await userCol().where('sellRvIds', 'array-contains', req.params.id).get();
    if (!usersSnap.empty) {
        const batch = db.batch();
        usersSnap.docs.forEach(doc => {
            batch.update(doc.ref, {
                sellRvIds: FieldValue.arrayRemove(req.params.id),
                updatedAt: FieldValue.serverTimestamp()
            });
        });
        await batch.commit();
    }

    res.status(200).json({ success: true, data: sellRv });
});


module.exports = { addSellRv, getUserSellRvs, getSellRv, updateSellRv, deleteSellRv };
