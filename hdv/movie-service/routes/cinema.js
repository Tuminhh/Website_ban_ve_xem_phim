
require('dotenv').config();

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Cinema } = require('../models');

/**
 * @route   
 * @desc    
 */
router.get('/', async (req, res) => {
    try {
        const cinemas = await Cinema.findAll({
          order: [
            ['city', 'ASC'],
            ['name', 'ASC']
          ]
        });
        
        res.status(200).json(cinemas);

      } catch (err) {
        console.error('Lỗi khi lấy danh sách rạp:', err);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
      }
});


/**
 * @route   
 * @desc    
 */
router.get('/:cinemaId/showtimes', async (req, res) => {
    try {
        const { cinemaId } = req.params;

        const cinema = await Cinema.findByPk(cinemaId);
        if (!cinema) {
            return res.status(404).json({ error: 'Không tìm thấy rạp chiếu.' });
        }

        const apiKey = process.env.OMDB_API_KEY; 
        
        if (!apiKey) {
            throw new Error('OMDB_API_KEY chưa được thiết lập trong .env');
        }
        
        const omdbResponse = await axios.get(
            `https://www.omdbapi.com/?s=action&type=movie&apikey=${apiKey}`
        );

        if (omdbResponse.data.Error || !omdbResponse.data.Search) {
            return res.status(404).json({ error: 'Không tìm thấy phim từ OMDb.' });
        }

        const moviesFromOMDb = omdbResponse.data.Search;
        const randomMovies = moviesFromOMDb
                                .sort(() => 0.5 - Math.random())
                                .slice(0, 5); 

        const showtimeData = randomMovies.map(movie => {
            const generateTimes = () => {
                let times = new Set();
                while(times.size < 4) {
                    const hour = Math.floor(Math.random() * 12) + 10; 
                    const minute = Math.random() < 0.5 ? '00' : '30';
                    times.add(`${hour}:${minute}`);
                }
                return Array.from(times).sort();
            };

            return {
                movie: {
                    title: movie.Title,
                    posterUrl: movie.Poster,
                    duration: 'N/A'
                },
                showtimes: generateTimes()
            };
        });

        res.status(200).json(showtimeData);

    } catch (err) {
        console.error('Lỗi khi lấy suất chiếu:', err.message);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
});


module.exports = router;