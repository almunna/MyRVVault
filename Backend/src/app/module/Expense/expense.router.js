const express = require('express');
const router = express.Router();
const { 
    createExpense, 
    getExpenses, 
    getExpenseById, 
    updateExpense, 
    deleteExpense 
} = require('./expense.controller');
const upload = require('../../../utils/uploadConfig');
const { authenticateUser } = require('../../middleware/auth.middleware');

// Create a new expense
router.post('/create', authenticateUser, upload.array('images'), createExpense);

// Get all expenses with filtering, sorting, and pagination
router.get('/get', authenticateUser, getExpenses);

// Get a single expense by ID
router.get('/get/:id', authenticateUser, getExpenseById);

// Update an expense
router.put('/update/:id', authenticateUser, upload.array('images'), updateExpense);

// Delete an expense
router.post('/delete/:id', authenticateUser, deleteExpense);

module.exports = router;
