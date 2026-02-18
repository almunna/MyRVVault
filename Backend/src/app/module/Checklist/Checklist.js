const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required']
    },
    status: {
        type: Boolean,
        default: false,
    }, 
}, { timestamps: true });

const checklistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    items: [checklistItemSchema],
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
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
checklistSchema.index({ user: 1, rvId: 1 });

const Checklist = mongoose.model("Checklist", checklistSchema);
module.exports = Checklist;