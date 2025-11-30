require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/payments', require('./routes/payment'));


db.sequelize.sync().then(() => console.log("Payment Service DB Connected"));

const PORT = 3004;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));