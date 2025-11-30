
const crypto = require('crypto');
const moment = require('moment');

const config = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
    vnp_Url: process.env.VNPAY_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:8080/payment-result.html", 
    vnp_IpnUrl: process.env.VNPAY_IPN_URL     
};


exports.createPaymentRequest = async ({ orderId, amount, orderInfo, ipAddr }) => {
    
    const tmnCode = config.vnp_TmnCode;
    const secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    
    const createDate = moment().format('YYYYMMDDHHmmss');
    const vnp_TxnRef = `${orderId}_${createDate}`; 
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = vnp_TxnRef;
    

    vnp_Params['vnp_OrderInfo'] = `TEST`; 
    
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; 
    
    vnp_Params['vnp_ReturnUrl'] = config.vnp_ReturnUrl; 
    
    vnp_Params['vnp_CreateDate'] = createDate;
    
    vnp_Params['vnp_IpAddr'] = '8.8.8.8'; 

    let sortedKeys = Object.keys(vnp_Params).sort();

    let signData = "";
    for (let key of sortedKeys) {
        signData += `${encodeURIComponent(key)}=${encodeURIComponent(vnp_Params[key])}&`;
    }
    signData = signData.slice(0, -1); 

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    vnpUrl += `?${signData}&vnp_SecureHash=${signed}`;

    return { payUrl: vnpUrl };
};


exports.verifyCallback = (vnp_Params) => {
    
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType']; 

    let sortedKeys = Object.keys(vnp_Params).sort();
    
    let signData = "";
    for (let key of sortedKeys) {
        signData += `${encodeURIComponent(key)}=${encodeURIComponent(vnp_Params[key])}&`;
    }
    signData = signData.slice(0, -1); 

    const secretKey = config.vnp_HashSecret;
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    return secureHash === signed;
};