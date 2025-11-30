const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

router.post('/create-url', async (req, res) => {
    try {
        const result = await paymentService.createPaymentLink(req.body);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/callback/momo', async (req, res) => {
    try {
        await paymentService.processMomoCallback(req.body);
        res.status(204).send(); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/callback/vnpay', async (req, res) => {
    try {
        await paymentService.processVnpayCallback(req.query);
        res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } catch (err) {
        res.status(200).json({ RspCode: '97', Message: 'Fail Checksum' });
    }
});

module.exports = router;