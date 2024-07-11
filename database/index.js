
const mongoose = require('mongoose');
const {MONGO_CONNECTION_URL} = require('../config/index.js')
const connectdb = async () =>{
    try {
    const connectionInstance =  await  mongoose.connect(`${MONGO_CONNECTION_URL}`)
    console.log(`\n mongoDB connected !! DB host : ${connectionInstance.connection.host}`)
    } catch (error) {
         console.log("connection connection fail :",error);
         process.exit(1);
    }
}
module.exports = connectdb;


  
         

