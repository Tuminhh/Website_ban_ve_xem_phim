
const axios = require('axios'); 

const config = {
    api_endpoint: "https://api.vietqr.io/v2/generate",
    bankId: process.env.VIETQR_BANK_ID,
    accountNo: process.env.VIETQR_ACCOUNT_NO,
    accountName: process.env.VIETQR_ACCOUNT_NAME,
};

exports.createPaymentRequest = async ({ orderId, amount, orderInfo }) => {
    try {
        const addInfoContent = `PAY${orderId}`; 

        const payload = {
            accountNo: config.accountNo,
            accountName: config.accountName,
            acqId: config.bankId,
            amount: amount,
            addInfo: addInfoContent, 
            format: "text",
            template: "compact"
        };
        
        console.log("👉 Đang gửi payload này đến VietQR:", payload);
        const response = await axios.post(config.api_endpoint, payload);
        console.log("👉 VietQR đã trả về:", response.data);

        if (response.data.code === '00') { 
            return { 
                isVietQR: true, 
                qrDataURL: response.data.data.qrDataURL,
                orderId: orderId,
                amount: amount,
                orderInfo: addInfoContent
            };
        } else {
            throw new Error(response.data.desc || 'Lỗi không xác định từ VietQR');
        }

    } catch (error) {
        console.error("Lỗi TẬN CÙNG trong vietqr.js:", error.response ? error.response.data : error.message);
        throw error; 
    }
};