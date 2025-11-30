const express = require('express');
const router = express.Router();
const { Booking } = require('../models');
const auth = require('../middleware/auth'); 

/**
 * @route  
 * @desc    
 */
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { showtimeId, seats, totalPrice } = req.body;

        if (!showtimeId || !seats || !totalPrice) {
            return res.status(400).json({ error: 'Thiếu thông tin đặt vé.' });
        }

        const newBooking = await Booking.create({
            userId: userId,
            showtimeId: showtimeId,
            seats: seats.join(','),
            totalPrice: totalPrice
        });

        res.status(201).json(newBooking);

    } catch (err) {
        console.error('Lỗi khi đặt vé:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});

router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});


module.exports = router;