
const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  
  const Movie = sequelize.define('Movie', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, 
      allowNull: true
    },
    posterUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    trailerUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'movies',
    timestamps: true
  });

  Movie.associate = (models) => {
    Movie.hasMany(models.Showtime, {
      foreignKey: 'movieId',
      as: 'showtimes'
    });
  };

  return Movie;
};