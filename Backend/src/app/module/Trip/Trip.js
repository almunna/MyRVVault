const mongoose = require("mongoose");

const stateVisitSchema = new mongoose.Schema({
    state: {
        type: String,
        required: [true, 'State is required'],
        uppercase: true,
        enum: [
            'ALABAMA', 'ALASKA', 'ARIZONA', 'ARKANSAS', 'CALIFORNIA', 'COLORADO', 'CONNECTICUT', 'DELAWARE',
            'FLORIDA', 'GEORGIA', 'HAWAII', 'IDAHO', 'ILLINOIS', 'INDIANA', 'IOWA', 'KANSAS', 'KENTUCKY',
            'LOUISIANA', 'MAINE', 'MARYLAND', 'MASSACHUSETTS', 'MICHIGAN', 'MINNESOTA', 'MISSISSIPPI',
            'MISSOURI', 'MONTANA', 'NEBRASKA', 'NEVADA', 'NEW HAMPSHIRE', 'NEW JERSEY', 'NEW MEXICO',
            'NEW YORK', 'NORTH CAROLINA', 'NORTH DAKOTA', 'OHIO', 'OKLAHOMA', 'OREGON', 'PENNSYLVANIA',
            'RHODE ISLAND', 'SOUTH CAROLINA', 'SOUTH DAKOTA', 'TENNESSEE', 'TEXAS', 'UTAH', 'VERMONT',
            'VIRGINIA', 'WASHINGTON', 'WEST VIRGINIA', 'WISCONSIN', 'WYOMING'
        ]
    },
    status: {
        type: String,
        required: [true, 'Visit status is required'],
        enum: ['CAMPED', 'PLANNING', 'TRAVELED_THROUGH', 'NOT_VISITED'],
        uppercase: true,
        default: 'NOT_VISITED'
    },
    visitDate: {
        type: Date,
        required: function () {
            return this.status === 'CAMPED' || this.status === 'TRAVELED_THROUGH';
        }
    }
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Trip title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        validate: {
            validator: function (endDate) {
                return !endDate || endDate >= this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    states: [stateVisitSchema],
    tripName: {
        type: String,
        // required: [true, 'Trip type is required'],
        // enum: ['CAMPED', 'PLANNING', 'TRAVELED_THROUGH', 'NOT_VISITED'],
        uppercase: true,
        default: ''
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RV",
        required: [true, 'RV ID is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User ID is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for trip duration
tripSchema.virtual('duration').get(function () {
    if (!this.endDate) return null;
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Days
});

// Indexes for better query performance
tripSchema.index({ user: 1, startDate: -1 });
tripSchema.index({ user: 1, "states.state": 1 });
tripSchema.index({ user: 1, "states.status": 1 });

// Static method to get state statistics for a user
tripSchema.statics.getStateStatistics = function (userId) {
    return this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId), isActive: true } },
        { $unwind: "$states" },
        {
            $group: {
                _id: {
                    state: "$states.state",
                    status: "$states.status"
                },
                count: { $sum: 1 },
                lastVisit: { $max: "$states.visitDate" }
            }
        },
        {
            $group: {
                _id: "$_id.state",
                visits: {
                    $push: {
                        status: "$_id.status",
                        count: "$count",
                        lastVisit: "$lastVisit"
                    }
                },
                totalVisits: { $sum: "$count" }
            }
        },
        { $sort: { totalVisits: -1 } }
    ]);
};

// Instance method to add state visit
tripSchema.methods.addStateVisit = function (state, status, visitDate = null) {
    const stateVisit = {
        state: state.toUpperCase(),
        status: status.toUpperCase()
    };

    if (visitDate) {
        stateVisit.visitDate = visitDate;
    } else if (status.toUpperCase() !== 'PLANNING') {
        stateVisit.visitDate = this.startDate;
    }

    this.states.push(stateVisit);
    return this.save();
};

// Instance method to remove state visit
tripSchema.methods.removeStateVisit = function (stateVisitId) {
    this.states = this.states.filter(visit => visit._id.toString() !== stateVisitId);
    return this.save();
};

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;