const JWTService = require("../services/JWTService");
const User = require('../models/user.js');
const UserDTO = require('../dto/user.js')
const auth = async (req, res , next) =>{
    //refresh and access token validation
    const {refreshToken, accessToken} = req.cookies;
    try {
        if(!refreshToken || !accessToken){
            const error = {
                status : 401,
                message : 'Unauthorized'
            }
            return next(error);
        }
        let _id ;
        try {
      _id = JWTService.verifyAccessToken(accessToken)._id;
        } catch (error) {
            return next(error);
        };
    
        let user;
        try {
           user = await User.findOne({_id : _id}); 
        } catch (error) {
            return next(error);
        }
      const userData = new UserDTO(user);
      req.user = userData;
      next(); 
    } catch (error) {
        return next(error);
    }
   
}
module.exports = auth ;