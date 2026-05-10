const { db, FieldValue } = require('../../../config/db');
const asyncHandler = require('../../../utils/asyncHandler');
const { ApiError } = require('../../../errors/errorHandler');
const { docToObj, queryToArr } = require('../../../utils/firestoreHelper');
const QueryBuilder = require('../../../builder/queryBuilder');
const https = require('https');

const col = () => db.collection('vendors');

const VENDOR_CATEGORIES = [
    'rv_repair', 'rv_dealer', 'mobile_rv_tech', 'truck_repair',
    'auto_repair', 'tire_shop', 'campground', 'general_service', 'other'
];

// Google Places type ranking for RV relevance
const PLACES_TYPE_RANK = {
    rv_repair: 1, rv_dealer: 2, mobile_rv_tech: 3,
    truck_repair: 4, auto_repair: 5, tire_shop: 6, general_service: 7
};

exports.createVendor = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { name, category, address, phone, website, email, notes, isFavorite } = req.body;

    if (!name) throw new ApiError('Vendor name is required', 400);
    if (!category) throw new ApiError('Vendor category is required', 400);
    if (!VENDOR_CATEGORIES.includes(category)) {
        throw new ApiError(`Category must be one of: ${VENDOR_CATEGORIES.join(', ')}`, 400);
    }

    const data = {
        name,
        category,
        address: address || null,
        phone: phone || null,
        website: website || null,
        email: email || null,
        notes: notes || null,
        isFavorite: isFavorite === true || isFavorite === 'true',
        source: 'user',
        user: userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();

    res.status(201).json({ success: true, message: 'Vendor created successfully', data: docToObj(snap) });
});


exports.getAllVendors = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { category, favorites } = req.query;

    let colRef = col().where('user', '==', userId);
    if (category) colRef = colRef.where('category', '==', category);
    if (favorites === 'true') colRef = colRef.where('isFavorite', '==', true);

    const result = await new QueryBuilder(colRef, req.query)
        .search(['name', 'address', 'notes'])
        .sort()
        .paginate()
        .execute();

    res.status(200).json({
        success: true,
        message: result.data.length ? 'Vendors retrieved successfully' : 'No vendors found',
        meta: result.meta,
        data: result.data
    });
});


exports.getVendor = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Vendor not found', 404);

    const vendor = docToObj(snap);
    if (vendor.user !== userId) throw new ApiError('Vendor not found', 404);

    res.status(200).json({ success: true, data: vendor });
});


exports.updateVendor = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { name, category, address, phone, website, email, notes } = req.body;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Vendor not found', 404);

    const vendor = docToObj(snap);
    if (vendor.user !== userId) throw new ApiError('Vendor not found', 404);

    if (category && !VENDOR_CATEGORIES.includes(category)) {
        throw new ApiError(`Category must be one of: ${VENDOR_CATEGORIES.join(', ')}`, 400);
    }

    const updates = { updatedAt: FieldValue.serverTimestamp() };
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (website !== undefined) updates.website = website;
    if (email !== undefined) updates.email = email;
    if (notes !== undefined) updates.notes = notes;

    await col().doc(req.params.id).update(updates);
    const updated = docToObj(await col().doc(req.params.id).get());

    res.status(200).json({ success: true, message: 'Vendor updated successfully', data: updated });
});


exports.deleteVendor = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Vendor not found', 404);

    const vendor = docToObj(snap);
    if (vendor.user !== userId) throw new ApiError('Vendor not found', 404);

    await col().doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'Vendor deleted successfully', data: {} });
});


exports.toggleFavorite = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const snap = await col().doc(req.params.id).get();
    if (!snap.exists) throw new ApiError('Vendor not found', 404);

    const vendor = docToObj(snap);
    if (vendor.user !== userId) throw new ApiError('Vendor not found', 404);

    const newVal = !vendor.isFavorite;
    await col().doc(req.params.id).update({ isFavorite: newVal, updatedAt: FieldValue.serverTimestamp() });

    res.status(200).json({
        success: true,
        message: newVal ? 'Added to favorites' : 'Removed from favorites',
        data: { isFavorite: newVal }
    });
});


// Google Places nearby search proxy — keeps the API key server-side
exports.findNearby = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 16093, type } = req.query; // 16093m ≈ 10 miles

    if (!lat || !lng) throw new ApiError('lat and lng are required', 400);

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new ApiError('Google Places not configured', 503);

    // Search types ordered by RV relevance
    const searchTypes = type ? [type] : ['rv_repair', 'car_repair', 'car_dealer', 'tire_store', 'gas_station'];

    const fetchPlaces = (placeType) => new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            location: `${lat},${lng}`,
            radius: String(radius),
            type: placeType,
            key: apiKey
        });
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;

        https.get(url, (resp) => {
            let data = '';
            resp.on('data', chunk => { data += chunk; });
            resp.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { resolve({ results: [] }); }
            });
        }).on('error', reject);
    });

    const categoryMap = {
        rv_repair: 'rv_repair', car_repair: 'auto_repair',
        car_dealer: 'rv_dealer', tire_store: 'tire_shop', gas_station: 'general_service'
    };

    const rankMap = { rv_repair: 1, car_repair: 3, car_dealer: 2, tire_store: 4, gas_station: 5 };

    const resultsMap = new Map();

    for (const placeType of searchTypes) {
        const response = await fetchPlaces(placeType);
        if (response.results) {
            response.results.forEach(place => {
                if (!resultsMap.has(place.place_id)) {
                    resultsMap.set(place.place_id, {
                        placeId: place.place_id,
                        name: place.name,
                        address: place.vicinity,
                        rating: place.rating || null,
                        totalRatings: place.user_ratings_total || 0,
                        phone: null,
                        website: null,
                        category: categoryMap[placeType] || 'general_service',
                        rvRelevanceRank: rankMap[placeType] || 5,
                        isOpenNow: place.opening_hours?.open_now ?? null,
                        location: place.geometry?.location || null,
                        source: 'google'
                    });
                }
            });
        }
    }

    const sorted = Array.from(resultsMap.values())
        .sort((a, b) => a.rvRelevanceRank - b.rvRelevanceRank || (b.rating || 0) - (a.rating || 0));

    res.status(200).json({ success: true, count: sorted.length, data: sorted });
});


// Fetch phone + website for a single Google Place via Place Details API
exports.getPlaceDetails = asyncHandler(async (req, res) => {
    const { placeId } = req.query;
    if (!placeId) throw new ApiError('placeId is required', 400);

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new ApiError('Google Places not configured', 503);

    const details = await new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            place_id: placeId,
            fields: 'formatted_phone_number,international_phone_number,website',
            key: apiKey
        });
        const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;
        https.get(url, (resp) => {
            let data = '';
            resp.on('data', chunk => { data += chunk; });
            resp.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { resolve({ result: {} }); }
            });
        }).on('error', reject);
    });

    const result = details.result || {};
    res.status(200).json({
        success: true,
        data: {
            phone: result.formatted_phone_number || result.international_phone_number || null,
            website: result.website || null
        }
    });
});


// Save a Google Places result as a user vendor
exports.saveGooglePlace = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { placeId, name, address, phone, website, category, notes } = req.body;

    if (!name) throw new ApiError('Name is required', 400);

    const validCategory = VENDOR_CATEGORIES.includes(category) ? category : 'general_service';

    const data = {
        name,
        category: validCategory,
        address: address || null,
        phone: phone || null,
        website: website || null,
        email: null,
        notes: notes || null,
        isFavorite: false,
        source: 'google',
        placeId: placeId || null,
        user: userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await col().add(data);
    const snap = await ref.get();

    res.status(201).json({ success: true, message: 'Vendor saved successfully', data: docToObj(snap) });
});
