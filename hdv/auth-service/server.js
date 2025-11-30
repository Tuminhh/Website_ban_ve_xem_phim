require('dotenv').config();
const express = require("express");
const cors = require("cors");
const passport = require('passport');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
require('./config/passport.js')(passport); 

const db = require("./models/index.js");

db.sequelize.sync()
  .then(() => console.log("Auth Service: Đã kết nối CSDL."))
  .catch((err) => console.log("Lỗi kết nối CSDL: " + err.message));

app.use('/api/users', require('./routes/users.js'));
app.use('/api/auth', require('./routes/social.auth.js'));


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth Service đang chạy trên cổng ${PORT}.`);
});