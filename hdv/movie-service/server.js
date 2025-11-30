require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/movies', require('./routes/movies')); 
app.use('/cinemas', require('./routes/cinema')); 
app.use('/showtimes', require('./routes/showtime')); 

const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log("✅ DB Connected");
        await db.sequelize.sync();
        const PORT = 3002;
        app.listen(PORT, () => console.log(`Movie Service running on port ${PORT}`));
    } catch (err) {
        console.error("❌ DB Error:", err.message);
        setTimeout(startServer, 5000);
    }
};
startServer();