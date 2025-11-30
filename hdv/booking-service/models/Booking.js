
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  
  const Booking = sequelize.define('Booking', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    showtimeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'showtimes', 
        key: 'id'
      }
    },
    seats: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 0), 
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'confirmed' 
    }
  }, {
    tableName: 'bookings',
    timestamps: true
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Booking.belongsTo(models.Showtime, {
      foreignKey: 'showtimeId',
      as: 'showtime'
    });
  };

  return Booking;
};