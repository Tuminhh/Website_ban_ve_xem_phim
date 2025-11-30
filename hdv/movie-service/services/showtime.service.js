
require('dotenv').config({ path: '../.env' }); 
const { Op } = require('sequelize');
const { Movie, Cinema, Showtime } = require('../models');
const axios = require('axios'); 

const OMDB_API_KEY = process.env.OMDB_API_KEY;


const cleanOldMovies = async () => {
    console.log('CRON: Bắt đầu xóa phim cũ...');
    try {
        
        const moviesWithoutShowtimes = await Movie.findAll({
            include: {
                model: Showtime,
                as: 'showtimes',
                required: false
            },
            raw: false
        });

        let deletedCount = 0;
        for (const movie of moviesWithoutShowtimes) {
            if (!movie.showtimes || movie.showtimes.length === 0) {
                await movie.destroy();
                deletedCount++;
            }
        }
        console.log(`CRON: Đã xóa thành công ${deletedCount} phim cũ.`);
    } catch (err) {
        console.error('CRON: Lỗi khi xóa phim cũ:', err);
    }
};

const syncMoviesFromOMDb = async () => {
    console.log('CRON: Bắt đầu đồng bộ phim từ OMDb...');
    try {
        if (!OMDB_API_KEY) throw new Error('OMDB_API_KEY bị thiếu');

        const response = await axios.get(`https://www.omdbapi.com/?s=love&type=movie&apikey=${OMDB_API_KEY}`);
        if (!response.data || !response.data.Search) {
            console.log('CRON: OMDb không trả về phim nào.');
            return;
        }

        const moviesFromAPI = response.data.Search.slice(0, 10); 
        let moviesAdded = 0;


        for (const movieData of moviesFromAPI) {
            

            const detailRes = await axios.get(`https://www.omdbapi.com/?i=${movieData.imdbID}&apikey=${OMDB_API_KEY}`);
            const movieDetail = detailRes.data;


            const [movie, created] = await Movie.findOrCreate({
                where: { title: movieDetail.Title },
                defaults: {
                    description: movieDetail.Plot,
                    releaseDate: new Date(movieDetail.Released),
                    duration: parseInt(movieDetail.Runtime) || 120, 
                    posterUrl: movieDetail.Poster,
                    trailerUrl: '' 
                }
            });

            if (created) {
                moviesAdded++;
            }
        }
        console.log(`CRON: Đã đồng bộ xong. Thêm mới ${moviesAdded} phim.`);

    } catch (err) {
        console.error('CRON: Lỗi khi đồng bộ OMDb:', err.message);
    }
};


const cleanOldShowtimes = async () => {
    console.log('CRON: Bắt đầu xóa suất chiếu cũ...');
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log(`CRON: Xóa suất chiếu trước ${today.toISOString()}`);
        
        const result = await Showtime.destroy({
            where: {
                startTime: {
                    [Op.lt]: today 
                }
            }
        });
        console.log(`CRON: Đã xóa thành công ${result} suất chiếu cũ.`);
    } catch (err) {
        console.error('CRON: Lỗi khi xóa suất chiếu:', err);
    }
};


// const seedRandomShowtimes = async () => {

//     await cleanOldMovies();

//     await syncMoviesFromOMDb();

//     console.log('CRON: Bắt đầu thêm suất chiếu ngẫu nhiên...');
//     try {
        
//         const movies = await Movie.findAll(); 
//         const cinemas = await Cinema.findAll();

//         if (movies.length === 0 || cinemas.length === 0) {
//             console.log('CRON: Không có phim hoặc rạp để tạo suất chiếu.');
//             return;
//         }

//         const newShowtimes = [];
//         const baseTimes = ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30'];
//         const tomorrow = new Date();
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         for (const cinema of cinemas) {
//             const selectedMovies = movies.sort(() => 0.5 - Math.random()).slice(0, 5); 

//             for (const movie of selectedMovies) {
//                 const selectedTimes = baseTimes.sort(() => 0.5 - Math.random()).slice(0, 3); 
                
//                 for (const time of selectedTimes) {
//                     const [hour, minute] = time.split(':');
//                     const startTime = new Date(tomorrow.setHours(hour, minute, 0, 0));
                    
//                     const duration = movie.duration || 120;
//                     const endTime = new Date(startTime.getTime() + duration * 60000);

//                     newShowtimes.push({
//                         movieId: movie.id, 
//                         cinemaId: cinema.id,
//                         startTime: startTime,
//                         endTime: endTime
//                     });
//                 }
//             }
//         }

//         await Showtime.bulkCreate(newShowtimes);
//         console.log(`CRON: Đã thêm thành công ${newShowtimes.length} suất chiếu mới.`);

//     } catch (err) {
//         console.error('CRON: Lỗi khi thêm suất chiếu ngẫu nhiên:', err);
//     }
// };

module.exports = {
    cleanOldShowtimes,
    cleanOldMovies,
    seedRandomShowtimes
};