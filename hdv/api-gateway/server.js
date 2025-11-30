const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const MOVIE_URL = process.env.MOVIE_SERVICE_URL || 'http://movie-service:3002';
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3003';
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';

console.log(`Gateway targets: Movie->${MOVIE_URL}, Booking->${BOOKING_URL}`);

app.use('/api/movies', createProxyMiddleware({ 
    target: MOVIE_URL, 
    changeOrigin: true,
    pathRewrite: { '^/api/movies': '/movies' } 
}));

app.use('/api/cinemas', createProxyMiddleware({ 
    target: MOVIE_URL, 
    changeOrigin: true,
    pathRewrite: { '^/api/cinemas': '/cinemas' } 
}));

app.use('/api/showtimes', createProxyMiddleware({ 
    target: MOVIE_URL, 
    changeOrigin: true,
    pathRewrite: { '^/api/showtimes': '/showtimes' } 
}));

app.use('/api/bookings', createProxyMiddleware({ 
    target: BOOKING_URL, 
    changeOrigin: true,
    pathRewrite: { '^/api/bookings': '/bookings' } 
}));

app.use('/api/payments', createProxyMiddleware({ 
    target: PAYMENT_URL, 
    changeOrigin: true,
    pathRewrite: { '^/api/payments': '/payments' } 
}));


app.use('/api/users', createProxyMiddleware({ 
    target: AUTH_URL, 
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' } 
}));

app.use('/api/auth', createProxyMiddleware({ 
    target: AUTH_URL, 
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/auth' } 
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway đang chạy trong Docker tại port ${PORT}`);
});