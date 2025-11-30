require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Movie } = require('../models');

const OMDB_API_KEY = process.env.OMDB_API_KEY || 'fa85c569';
const OMDB_API_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;


router.get('/', async (req, res) => {
    try {
        const movies = await Movie.findAll({ order: [['createdAt', 'DESC']] });
        res.json(movies);
    } catch (err) {
        console.error("Lỗi lấy danh sách phim:", err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});


router.get('/search', async (req, res) => {
    const { s } = req.query;
    if (!s) return res.json([]);
    try {
        const response = await axios.get(`${OMDB_API_URL}&s=${encodeURIComponent(s)}&type=movie`);
        if (response.data.Error) return res.json([]);
        res.json(response.data.Search || []);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi kết nối OMDb' });
    }
});


router.get('/id/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`🔍 Đang tìm phim với ID: ${id}`); 

    try {
        if (/^\d+$/.test(id)) {
            const localMovie = await Movie.findByPk(id);
            
            if (localMovie) {
                console.log("✅ Tìm thấy trong DB nội bộ");
                
                return res.json({
                    Response: "True",
                    Title: localMovie.title,
                    Year: localMovie.releaseDate ? new Date(localMovie.releaseDate).getFullYear() : 'N/A',
                    imdbID: localMovie.id, 
                    Type: 'movie',
                    Poster: localMovie.posterUrl,
                    Plot: localMovie.description,
                    Runtime: (localMovie.duration || 0) + ' min',
                    Director: 'Đang cập nhật',
                    Actors: 'Đang cập nhật',
                    Genre: 'Phim Chiếu Rạp',
                    imdbRating: '8.0' 
                });
            } else {
                console.log("❌ Không tìm thấy ID này trong DB nội bộ");
                return res.status(404).json({ Response: 'False', Error: 'Không tìm thấy phim trong hệ thống.' });
            }
        }

        console.log("🌏 Đang tìm trên OMDb...");
        const response = await axios.get(`${OMDB_API_URL}&i=${id}&plot=full`);
        
        if (response.data.Error) {
            console.log("❌ OMDb không tìm thấy");
            return res.status(404).json(response.data);
        }
        
        console.log("✅ Tìm thấy trên OMDb");
        res.json(response.data);

    } catch (err) {
        console.error('Lỗi chi tiết:', err.message);
        res.status(500).json({ Response: 'False', Error: 'Lỗi server nội bộ' });
    }
});

module.exports = router;