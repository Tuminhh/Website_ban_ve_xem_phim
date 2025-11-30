
const { Payment } = require('../models');
const getProvider = require('../providers/index'); 
const axios = require('axios');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3003';

exports.createPaymentLink = async (paymentData) => {
    
    console.log("[SERVICE 4004] 💡: Đã vào hàm createPaymentLink."); 
    const { orderId, amount, orderInfo, providerName, ipAddr } = paymentData;

    console.log("[SERVICE 4004] 💡: Đang gọi 'Nhà máy' (providers/index)..."); 
    const provider = getProvider(providerName);

    let result = {};
    let providerPayload = {
        orderId: orderId, amount: amount,
        orderInfo: orderInfo, ipAddr: ipAddr
    };

    if (providerName === 'momo') {
        providerPayload.orderId = `${orderId}_${new Date().getTime()}`; 
        console.log("[SERVICE 4004] 💡: Đang gọi Momo.createPaymentRequest..."); 
        result = await provider.createPaymentRequest(providerPayload);

    } else if (providerName === 'vnpay') {
        console.log("[SERVICE 4004] 💡: Đang gọi VNPay.createPaymentRequest..."); 
        result = await provider.createPaymentRequest(providerPayload);
    
    } else if (providerName === 'chuyenkhoan') {
        console.log("[SERVICE 4004] 💡: Đang gọi VietQR.createPaymentRequest..."); 
        result = await provider.createPaymentRequest(providerPayload);
    
    } else if (providerName === 'cash') {
        result = { 
            isCash: true, 
            orderId: orderId, 
            amount: amount,
            orderInfo: `Dat ve ${orderId} thanh toan tai quay`
        };
    } else {
        throw new Error('Provider không hợp lệ');
    }
    
    console.log("[SERVICE 4004] 💡: Đã tạo link xong, trả về Controller."); 
    return result; 
};

exports.processMomoCallback = async (data) => {
    const provider = getProvider('momo');
    if (!provider.verifySignature(data)) throw new Error('Invalid Signature');
    const realBookingId = data.orderId.split('_')[0];
    await Payment.create({ /* ... */ });
    if (data.resultCode == 0) {
        await axios.post(`${BOOKING_SERVICE_URL}/update-status`, {
            bookingId: realBookingId, status: 'CONFIRMED'
        });
    }
};
exports.processVnpayCallback = async (vnp_Params) => {
    const provider = getProvider('vnpay');
    if (!provider.verifyCallback(vnp_Params)) throw new Error('Invalid VNPay Signature');
    const realBookingId = vnp_Params['vnp_TxnRef'].split('_')[0];
    await Payment.create({ /* ... */ });
    if (vnp_Params['vnp_ResponseCode'] === '00') {
        await axios.post(`${BOOKING_SERVICE_URL}/update-status`, {
            bookingId: realBookingId, status: 'CONFIRMED'
        });
    }
};
exports.getBookingStatus = async (bookingId) => {
    try {
        const response = await axios.get(`${BOOKING_SERVICE_URL}/status/${bookingId}`);
        return response.data.status; 
    
    } catch (error) {
        console.error("Lỗi khi 4004 gọi 4003 để check status:", error.message);
        return 'NOT_FOUND';
    }
};