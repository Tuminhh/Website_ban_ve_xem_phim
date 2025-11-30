
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Không có token' });

    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : parts[0];

    const SECRET = process.env.JWT_SECRET || 'secret'; 
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        console.warn('Auth middleware - token verify failed:', err.message);
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
      }
      req.user = { id: decoded.id, email: decoded.email };
      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Lỗi xác thực' });
  }
};