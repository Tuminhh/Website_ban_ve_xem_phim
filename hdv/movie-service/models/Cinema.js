
const { DataTypes } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  
  const Cinema = sequelize.define('Cinema', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'cinemas',
    timestamps: true
  });

  return Cinema;
};