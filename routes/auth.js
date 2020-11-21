const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const signUpValidators=require('./validators/signUpValidators.js')

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup',signUpValidators, authController.postSignup);

router.post('/logout', authController.postLogout);
router.get('/reset-password',authController.getResetPassReq)
router.post('/reset-password',authController.postResetPassReq)
router.get('/new-password/:token',authController.getNewPassword)
router.post('/new-password',authController.postNewPassword)
module.exports = router;