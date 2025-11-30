require('dotenv').config();
const express = require('express');
const router = express.Router();
const { User } = require('../models'); 
const bcrypt = require('bcryptjs');    
const jwt = require('jsonwebtoken');     
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, phone } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase().trim() : null;
    const password = req.body.password ? req.body.password.trim() : null;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email đã được sử dụng' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ 
      username, email, password: hashedPassword, phone 
    });

    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    res.status(201).json({ message: 'Đăng ký thành công', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi tạo tài khoản' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : null;
    const password = req.body.password ? req.body.password.trim() : null;

    if (!email || !password) return res.status(400).json({ error: 'Thiếu thông tin.' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    
    if (!user.password) return res.status(401).json({ error: 'Tài khoản này đăng nhập bằng Google/Facebook.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;
    
    return res.json({ 
        message: "Đăng nhập thành công",
        data: { token: token, user: userWithoutPassword } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'googleId', 'facebookId'] }
        });
        if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
});

module.exports = router;