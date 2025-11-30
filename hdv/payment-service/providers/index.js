
const momoProvider = require('./momo');
const vnpayProvider = require('./vnpay');
const vietqrProvider = require('./vietqr');

module.exports = (providerName) => {
    switch (providerName) {
        case 'momo':
            return momoProvider;
        
        case 'vnpay':
            return vnpayProvider;
        case 'chuyenkhoan':
            return vietqrProvider;
            case 'cash': 
            return {}; 
        default:
            throw new Error(`Cổng thanh toán '${providerName}' không được hỗ trợ.`);
    }
};