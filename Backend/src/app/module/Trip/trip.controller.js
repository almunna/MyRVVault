const Trip = require("./Trip");
const asyncHandler = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../errors/errorHandler");
const getSelectedRvByUserId = require("../../../utils/currentRv");
const QueryBuilder = require("../../../builder/queryBuilder");

// @desc    Create a new trip
// @route   POST /api/v1/trips
// @access  Private
exports.createTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, description, startDate, endDate, tripName, states, rvId } = req.body;

    const selectedRvId = await getSelectedRvByUserId(userId);
    const targetRvId = rvId || selectedRvId;
    
    if (!targetRvId) {
        throw new ApiError("No RV selected. Please select an RV first.", 400);
    }

    // Process states with proper dates
    const processedStates = states.map(stateVisit => ({
        ...stateVisit,
        state: stateVisit.state.toUpperCase(),
        status: stateVisit.status.toUpperCase(),
        visitDate: stateVisit.visitDate || 
                  (stateVisit.status.toUpperCase() !== 'PLANNING' ? startDate : null)
    }));

    const trip = await Trip.create({ 
        title,
        description,
        startDate,
        endDate,
        tripName: tripName.toUpperCase(),
        states: processedStates,
        rvId: targetRvId,
        user: userId
    });

    res.status(201).json({
        success: true,
        message: 'Trip created successfully',
        data: trip
    });
});

// @desc    Get all trips for the current user
// @route   GET /api/v1/trips
// @access  Private
exports.getAllTrips = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    
    const baseQuery = { 
        user: userId, 
        isActive: true 
    };

    const tripQuery = new QueryBuilder(
        Trip.find(baseQuery).populate('rvId', 'name licensePlate'),
        req.query
    )
        .search(['title', 'description', 'tripName'])  // Add searchable fields
        .filter()
        .sort()
        .paginate()
        .fields();

    const trips = await tripQuery.modelQuery;
    const meta = await new QueryBuilder(
        Trip.find(baseQuery),
        req.query
    ).countTotal();

    if (!trips || trips.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No trips found',
            meta,
            data: trips
        });
    }

    res.status(200).json({
        success: true,
        message: 'Trips retrieved successfully',
        meta,
        data: trips
    });
});

// @desc    Get single trip
// @route   GET /api/v1/trips/:id
// @access  Private
exports.getTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const trip = await Trip.findOne({
        _id: req.params.id,
        user: userId,
        isActive: true
    }).populate('rvId', 'name licensePlate');

    if (!trip) {
        return res.status(200).json({
            success: true,
            message: 'Trip not found',
            data: null
        });
    }

    res.status(200).json({
        success: true,
        data: trip
    });
});

// @desc    Update trip
// @route   PATCH /api/v1/trips/:id
// @access  Private
exports.updateTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { title, description, startDate, endDate, tripName, states } = req.body;

    const trip = await Trip.findOne({
        _id: req.params.id,
        user: userId,
        isActive: true
    });

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    // Update basic fields
    if (title !== undefined) trip.title = title;
    if (description !== undefined) trip.description = description;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (tripName !== undefined) trip.tripName = tripName?.toUpperCase();

    // Update states if provided
    if (states !== undefined) {
        trip.states = states.map(stateVisit => ({
            ...stateVisit,
            state: stateVisit.state.toUpperCase(),
            status: stateVisit.status.toUpperCase(),
            visitDate: stateVisit.visitDate || 
                      (stateVisit.status.toUpperCase() !== 'PLANNING' ? trip.startDate : null)
        }));
    }

    await trip.save();

    res.status(200).json({
        success: true,
        message: 'Trip updated successfully',
        data: trip
    });
});

// @desc    Delete trip (soft delete)
// @route   DELETE /api/v1/trips/:id
// @access  Private
exports.deleteTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const trip = await Trip.findOneAndUpdate(
        {
            _id: req.params.id,
            user: userId
        },
        { isActive: false },
        { new: true }
    );

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Trip deleted successfully',
        data: {}
    });
});

// @desc    Add state visit to trip
// @route   POST /api/v1/trips/:id/states
// @access  Private
exports.addStateVisit = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { state, status, visitDate } = req.body;

    const trip = await Trip.findOne({
        _id: req.params.id,
        user: userId,
        isActive: true
    });

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    await trip.addStateVisit(state, status, visitDate);

    res.status(200).json({
        success: true,
        message: 'State visit added successfully',
        data: trip
    });
});

// @desc    Remove state visit from trip
// @route   DELETE /api/v1/trips/:id/states/:stateVisitId
// @access  Private
exports.removeStateVisit = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const trip = await Trip.findOne({
        _id: req.params.id,
        user: userId,
        isActive: true
    });

    if (!trip) {
        throw new ApiError('Trip not found', 404);
    }

    await trip.removeStateVisit(req.params.stateVisitId);

    res.status(200).json({
        success: true,
        message: 'State visit removed successfully',
        data: trip
    });
});

// @desc    Get state statistics for user (for map display)
// @route   GET /api/v1/trips/stats/map
// @access  Private
// exports.getStateStatistics = asyncHandler(async (req, res) => {
//     const userId = req.user.id || req.user._id;

//     const stateStats = await Trip.getStateStatistics(userId);

//     // Transform data for frontend map
//     const mapData = stateStats.reduce((acc, stateStat) => {
//         acc[stateStat._id] = {
//             state: stateStat._id,
//             total: stateStat.totalVisits,
//             camped: 0,
//             planning: 0,
//             traveled: 0
//         };

//         stateStat.visits.forEach(visit => {
//             acc[stateStat._id][visit.status.toLowerCase()] = visit.count;
//         });

//         return acc;
//     }, {});

//     res.status(200).json({
//         success: true,
//         data: Object.values(mapData)
//     });
// });

exports.getStateStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;

    const trips = await Trip.find({ 
        user: userId, 
        isActive: true 
    }).select('states');

    const stateStats = {};
    
    trips.forEach(trip => {
        trip.states.forEach(stateVisit => {
            const stateName = stateVisit.name;
            const status = stateVisit.status.toLowerCase();
            
            if (!stateStats[stateName]) {
                stateStats[stateName] = {
                    state: stateName,
                    total: 0,
                    camped: 0,
                    planning: 0,
                    traveled: 0,
                    lastVisit: null
                };
            }
            
            stateStats[stateName].total += 1;
            
            if (status === 'camped') stateStats[stateName].camped += 1;
            else if (status === 'planning') stateStats[stateName].planning += 1;
            else if (status === 'traveled_through') stateStats[stateName].traveled += 1;
            
            if (stateVisit.visitDate) {
                if (!stateStats[stateName].lastVisit || stateVisit.visitDate > stateStats[stateName].lastVisit) {
                    stateStats[stateName].lastVisit = stateVisit.visitDate;
                }
            }
        });
    });

    const result = Object.values(stateStats).sort((a, b) => b.total - a.total);

    res.status(200).json({
        success: true,
        data: result
    });
});


// @desc    Get trips by state
// @route   GET /api/v1/trips/state/:state
// @access  Private
exports.getTripsByState = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const state = req.params.state.toUpperCase();

    const trips = await Trip.find({
        user: userId,
        isActive: true,
        "states.state": state
    }).sort({ startDate: -1 });

    res.status(200).json({
        success: true,
        count: trips.length,
        state: state,
        data: trips
    });
});