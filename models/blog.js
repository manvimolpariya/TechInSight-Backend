const mongoose = require('mongoose');
const {Schema} = mongoose;
const blogschema = new Schema({
    title : 
    {type : String,
     required : true
    },
    content:
    {type : String,
     required : true
    },
    photoPath:
    {type : String,
     required : true
    },
    author :{
     type : mongoose.SchemaTypes.ObjectId,
     required : true,
     ref: 'User'
    }
},{timestamps : true}
);
module.exports = mongoose.model('Blog', blogschema, 'blogs');
