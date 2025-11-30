
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  
  const Showtime = sequelize.define('Showtime', {
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'movies',
        key: 'id'
      }
    },
    cinemaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cinemas',
        key: 'id'
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'showtimes',
    timestamps: true
  });

  Showtime.associate = (models) => {
    Showtime.belongsTo(models.Movie, {
      foreignKey: 'movieId',
      as: 'movie'
    });
    
    Showtime.belongsTo(models.Cinema, {
      foreignKey: 'cinemaId',
      as: 'cinema'
    });
  };

  return Showtime;
};