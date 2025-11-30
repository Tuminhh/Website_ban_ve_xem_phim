const crypto = require('crypto');

exports.createHmacSha256 = (data, secretKey) => {
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
};