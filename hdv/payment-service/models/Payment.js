module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    orderId: { type: DataTypes.STRING, allowNull: false }, 
    bookingId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 0), allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false }, 
    status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    transactionCode: { type: DataTypes.STRING }, 
    rawResponse: { type: DataTypes.TEXT } 
  });
  return Payment;
};