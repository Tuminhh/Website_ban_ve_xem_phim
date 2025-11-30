const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Showtime, Movie, Cinema } = require('../models');


require('dotenv').config();
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;


async function fetchOMDbByTitle(title) {
    try {
        const res = await axios.get(`${OMDB_API_URL}&t=${encodeURIComponent(title)}&plot=full`);
        if (res.data && res.data.Response !== 'False') {
            return res.data;
        }
        return null;
    } catch (err) {
        console.error('fetchOMDbByTitle error:', err.message);
        return null;
    }
}


router.get('/', async (req, res) => {
    try {
        const { movieId, cinemaId } = req.query;
        const whereCondition = {};
        
        if (movieId) whereCondition.movieId = movieId;
        if (cinemaId) whereCondition.cinemaId = cinemaId;

        const showtimes = await Showtime.findAll({
            where: whereCondition,
            include: [
                { model: Movie, as: 'movie' },
                { model: Cinema, as: 'cinema' }
            ],
            order: [['startTime', 'ASC']]
        });

        const results = showtimes.map(st => ({
            id: st.id,
            startTime: st.startTime,
            endTime: st.endTime,
            price: st.price || 75000,
            availableSeats: st.availableSeats,
            time: new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            movie: st.movie,
            cinema: st.cinema
        }));

        res.status(200).json(results);
    } catch (err) {
        console.error("Lỗi lấy showtimes:", err);
        res.status(500).json({ error: err.message });
    }
});



router.get('/by-cinema/:cinemaId', async (req, res) => {
    try {
        const showtimes = await Showtime.findAll({
            where: { cinemaId: req.params.cinemaId },
            include: [ 
                { model: Movie, as: 'movie' } 
            ],
            order: [['startTime', 'ASC']]
        });
        
        const movies = {};
        showtimes.forEach(st => {
            if (!st.movie) return;
            const movie = st.movie;
            if (!movies[movie.id]) {
                movies[movie.id] = {
                    id: movie.id,
                    title: movie.title,
                    posterUrl: movie.posterUrl,
                    duration: movie.duration,
                    showtimes: []
                };
            }
            const timeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            movies[movie.id].showtimes.push({
                id: st.id,
                time: timeStr,
                startTime: st.startTime,
                availableSeats: st.availableSeats
            });
        });

        res.status(200).json(Object.values(movies));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const showtime = await Showtime.findByPk(req.params.id, {
            include: [
                { model: Movie, as: 'movie' },
                { model: Cinema, as: 'cinema' }
            ]
        });
        if (!showtime) {
            return res.status(404).json({ error: 'Không tìm thấy suất chiếu' });
        }
        res.status(200).json(showtime);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/auto-create/:movieTitle', async (req, res) => {
    try {
        const movieTitle = decodeURIComponent(req.params.movieTitle);
        
        let movie = await Movie.findOne({ where: { title: movieTitle } });
        if (!movie) {
            const omdbData = await fetchOMDbByTitle(movieTitle);
            movie = await Movie.create({
                title: movieTitle,
                description: omdbData?.Plot || `Phim: ${movieTitle}`,
                posterUrl: (omdbData?.Poster && omdbData.Poster !== 'N/A') ? omdbData.Poster : '',
                duration: omdbData?.Runtime ? parseInt(omdbData.Runtime) : 120
            });
        }

        const cinemas = await Cinema.findAll();
        if (!cinemas || cinemas.length === 0) {
            return res.status(400).json({ error: 'Không có rạp chiếu nào trong hệ thống' });
        }

        const newShowtimes = [];
        const timeSlots = ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30'];
        
        for (const cinema of cinemas) {
            for (const time of timeSlots) {
                const [hour, minute] = time.split(':').map(Number);
                const today = new Date();
                today.setHours(hour, minute, 0);
                
                const exists = await Showtime.findOne({
                    where: {
                        movieId: movie.id,
                        cinemaId: cinema.id,
                        startTime: today
                    }
                });

                if (!exists) {
                    const endTime = new Date(today);
                    endTime.setMinutes(endTime.getMinutes() + 120);
                    
                    const showtime = await Showtime.create({
                        movieId: movie.id,
                        cinemaId: cinema.id,
                        startTime: today,
                        endTime: endTime,
                        availableSeats: 70
                    });
                    newShowtimes.push(showtime);
                }
            }
        }

        res.status(200).json({ 
            success: true, 
            message: `Đã thêm ${newShowtimes.length} suất chiếu cho phim "${movieTitle}"`,
            movie: movie,
            showtimes: newShowtimes
        });
    } catch (err) {
        console.error('Lỗi tạo suất chiếu:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;