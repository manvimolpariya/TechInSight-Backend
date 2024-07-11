const express = require('express');
const router = require('./routes/index.js')
const {PORT} = require('./config/index.js')
const errorHandler = require('./middlewares/errorHandle.js');
const connectdb  = require('./database/index.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const corsOption ={
    credentials : true,
    origin : ['http://localhost:5173'],
}
const app = express();
app.use(cookieParser());
app.use(cors(corsOption));
app.use(express.json({limit : '50mb'}));
app.use(router);

// const con =  mongoose.connect('mongodb://127.0.0.1:27017/React-Blog')
connectdb().then(()=> console.log(`Database connected to host `)) 
.catch((error) =>
console.log(`MongoDB connection Error is: ${error}`))
app.use('/storage', express.static('storage'));
app.use(errorHandler);
app.get('/',(req ,res)=> res.json({msg: 'Hello express:1'}));
app.listen(PORT , console.log(`Backend is running on Port : ${PORT}`))