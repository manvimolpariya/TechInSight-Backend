
const User = require('../models/user');
const  bcrypt = require('bcryptjs');
const Joi = require('joi');
const RefreshToken = require('../models/token.js')
const UserDTO = require('../dto/user');
const JWTService = require('../services/JWTService');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
    async register(req, res, next) {
        const userRegisterSchema = Joi.object({
            username : Joi.string().min(5).max(30).required(),
            name : Joi.string().max(30).required(),
            email : Joi.string().email().required(),
           password : Joi.string().pattern(passwordPattern).required(), 
           confirmPassword : Joi.ref('password'), 
        });
        const {error} = userRegisterSchema.validate(req.body);
        //2. if error in validation -> return error via middleware
        if(error){
            return next(error)
        }
        // if email or username is already register -> return error
        //check if email is already registered
        const {name , username, email, password} = req.body;
        try {
            const emailInUse = await User.exists({email});
            const usernameInUse = await User.exists({username});
            
            if(emailInUse){
                const error = {
                    status : 409,
                    message : 'Email is already registerd use another email'
                }
                return next(error);
            }
            if(usernameInUse){
                const error = {
                    status : 409,
                    message : 'Username is already registerd use another username'
                }
                return next(error);
            }
        } catch (error) {
            return next(error); 
        }
        // password hash
    const hashPassword = await bcrypt.hash(password, 10);

    let accessToken;
    let refreshToken;
    let user;
    try {
        
        const userToRegister = new  User({
            name : name,
            username : username,
            email :  email,
            password : hashPassword
        });
        user = await userToRegister.save();

        accessToken = JWTService.signAccessToken({_id : user._id}, '30m')
        refreshToken = JWTService.signRefreshToken({_id : user._id}, '60m');
    } catch (error) {
        return next(error)
    }
    await JWTService.storeRefreshToken(refreshToken, user._id);
    res.cookie('accessToken', accessToken, {
        maxAge : 1000 * 60 * 60 * 24,
        httpOnly:true
    });
    res.cookie('refreshToken' , refreshToken,  {
        maxAge : 1000 * 60 * 60 * 24,
        httpOnly:true
    })
    const userDTo = new UserDTO(user);
    return res.status(201).json({user : userDTo, auth : true});
    },
    // store user data in db
    
    async login(req, res, next) {
        const userLoginSchema = Joi.object({
           username : Joi.string().min(5).max(30).required(),
           password : Joi.string().pattern(passwordPattern)
        })
        const {error} = userLoginSchema.validate(req.body);
    if(error){
        return next(error);
    }
    const {username , password} = req.body;
    let user;
    try {
     
         user =  await User.findOne({username : username});
    if(!user){
        const error = {
            status : 401,
            message : 'Invalid username'
        }
        return next(error);
    }

    const match =  await bcrypt.compare(password, user.password);
    if(!match){
        const error ={
            status : 401,
            message : 'Invalid password'
        }
        return next(error);
    }
    } catch (error) {
        return next(error);
    }
   
   const  accessToken = JWTService.signAccessToken({_id : user._id}, '30m')
   const refreshToken = JWTService.signRefreshToken({_id : user._id}, '60m');
 
   //update refresh token in db
   try {
      await RefreshToken.updateOne({
        _id : user._id
       },
       {token : refreshToken},
       {upsert : true})
    
   } catch (error) {
    return next(error)
   }
  //send cookie
   res.cookie('accessToken', accessToken, {
       maxAge : 1000 * 60 * 60 * 24,
       httpOnly:true
   });
   res.cookie('refreshToken', refreshToken, {
    maxAge : 1000 * 60 * 60 * 24,
    httpOnly:true
});
    const userDTo = new UserDTO(user);
    return res.status(200).json({user : userDTo, auth : true})
    },
    async logout(req, res, next){
        console.log(req);
        const {refreshToken} = req.cookies;
        try {
         await RefreshToken.deleteOne({token: refreshToken})
        } catch (error) {
           return next(error) 
        } 
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
        res.status(200).json({user : null, auth: false});
    },
    //refresh controller
    async refresh( req, res , next){
      // get refresh token from cookie
      //verify refresh token
      const originalRefreshToken = req.cookies.refreshToken;
      let id;
      try {
        id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
      } catch (e) {
       const error = {
        status : 401,
        message : 'Unauthorized'
      } 
      return next(error);
      }
      try {
     const match = RefreshToken.findOne({_id : id, token : originalRefreshToken});

        if(!match){
            const error = {
                status : 401,
                message : 'Unauthorized'
            }
            return next(error);
        }
      }
      catch(e){
        return next(e);
      }
       //generate new token
      //update in db return respone
      try {
        const accessToken = JWTService.signAccessToken({_id : id}, '30m');
        const refreshToken = JWTService.signRefreshToken({_id : id},'60m');

      await  RefreshToken.updateOne({_id : id},{token : refreshToken});
      res.cookie('accessToken', accessToken , {
        maxAge : 1000 * 60 * 60 * 24,
        httpOnly : true
      });
       res.cookie('refreshToken', refreshToken , {
        maxAge : 1000 * 60 * 60 * 24,
        httpOnly : true
      });
    } catch (error) {
        return next(error);
    }
    const user = await User.findOne({_id : id});
    const userDto = new UserDTO(user);
     return  res.status(200).json({user : userDto, auth: true})
    }
    
};
module.exports = authController;
