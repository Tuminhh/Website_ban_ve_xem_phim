require('dotenv').config();
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL;

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/TaiKhoan.html?error=google_failed` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${CLIENT_URL}/auth-handler.html?token=${token}&user=${JSON.stringify(req.user)}`);
  }
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/TaiKhoan.html?error=facebook_failed` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${CLIENT_URL}/auth-handler.html?token=${token}&user=${JSON.stringify(req.user)}`);
  }
);

module.exports = router;