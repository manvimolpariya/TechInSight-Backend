const express = require('express');
const authController = require('../controller/authController.js');
const commentController = require('../controller/commentController.js');
const blogController = require('../controller/blogController.js')
const auth = require('../middlewares/auth.js')
const router = express.Router();

 router.get('/test', (req,res)=> res.json({msg: 'Working'}))
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', auth , authController.logout);
router.get('./refresh', authController.refresh);
router.post('/blog', auth , blogController.create);
router.get('/blog/all', blogController.getAll);
router.get('/blog/:id', auth , blogController.getById);
router.put('/blog', auth , blogController.update);
router.delete('/blog/:id', auth , blogController.delete);
router.post('/comment', auth, commentController.create);
router.get('/comment/:id', auth, commentController.getById);
module.exports = router;