require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/bookings', require('./routes/bookings'));

db.sequelize.sync().then(() => console.log("Booking Service DB Connected"));

const PORT = 3003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));