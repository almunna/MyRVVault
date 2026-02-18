const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import modules
const { addSellRv } = require('./app/module/SellRv/sellRv.controller');
const RV = require('./app/module/RV/RV');
const SellRv = require('./app/module/SellRv/SellRv');
const User = require('./app/module/User/User');

// Mock req, res
const mockReq = (body, user) => ({
    body,
    user
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function verify() {
    try {
        console.log('Connecting to DB...');
        // Assuming connectDB logic or just connect directly
        if (!process.env.MONGO_URI) {
            console.log('MONGO_URI not found in env, trying default local');
        }
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rv-maintainance', { dbName: "rv-maintainance" });
        console.log('Connected to DB');

        // 1. Create a User (Skip for now, use fake ID)
        // const user = await User.create({ ... });
        const userId = new mongoose.Types.ObjectId();
        console.log('Using fake User ID:', userId);

        // 2. Create an RV
        let rv;
        try {
            rv = await RV.create({
                user: userId,
                model: 'Test Model',
                isSold: false
            });
            console.log('RV created:', rv._id, 'isSold:', rv.isSold);
        } catch (err) {
            console.error('RV creation failed');
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            if (err.errors) {
                console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
            }
            throw err;
        }

        // 3. Call addSellRv
        const req = mockReq({
            rvType: 'Class A',
            amount: 50000,
            selectedSellRvId: rv._id
        }, { id: userId });
        const res = mockRes();

        await addSellRv(req, res);

        console.log('addSellRv response status:', res.statusCode);

        if (res.statusCode !== 201) {
            console.error('addSellRv failed:', res.data);
            throw new Error('addSellRv failed');
        }

        // 4. Verify SellRv created with isSold: true
        const sellRv = await SellRv.findById(res.data.data._id);
        console.log('SellRv created:', sellRv._id);
        console.log('SellRv isSold:', sellRv.isSold);

        if (sellRv.isSold !== true) throw new Error('SellRv.isSold should be true');

        // 5. Verify RV updated with isSold: true
        const updatedRv = await RV.findById(rv._id);
        console.log('Updated RV isSold:', updatedRv.isSold);

        if (updatedRv.isSold !== true) throw new Error('RV.isSold should be true');

        console.log('VERIFICATION SUCCESSFUL');

        // Cleanup
        // await User.findByIdAndDelete(user._id);
        await RV.findByIdAndDelete(rv._id);
        await SellRv.findByIdAndDelete(sellRv._id);

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

verify();
