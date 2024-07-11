const dotenv = require('dotenv').config();

const PORT = process.env.PORT;
const MONGO_CONNECTION_URL= process.env.MONGO_CONNECTION_URL;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const BACKEN_SERVER_PATH = process.env.BACKEN_SERVER_PATH
module.exports = {
    PORT,
    MONGO_CONNECTION_URL,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    BACKEN_SERVER_PATH
}