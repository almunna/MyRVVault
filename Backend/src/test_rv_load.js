const mongoose = require('mongoose');
try {
    const SellRv = require('./app/module/SellRv/SellRv');
    console.log('SellRv model loaded successfully');
} catch (err) {
    console.error('Failed to load SellRv model:', err);
}
