
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true 
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true 
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },

    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    facebookId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'users',
    timestamps: true 
  });
  
  return User;
};