const {body}=require('express-validator');
const User= require('../../models/user.js');

const validateEmail=body('email').isEmail().custom((email,{req})=>{
    return User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                return Promise.reject('email already exists',`${email} is already registered`)
            }
            
})})
const validatePassword=body('password').isLength({min:8}).withMessage('Password should be at least 8 characters long')
const validateConfirmPassword=body('confirmPassword').custom((value,{req})=>{
    if (value!==req.body['password'])
        throw new Error('Passwords do not match')
    return true;
}).withMessage('Passwords do not match')

module.exports=[validateEmail,validatePassword,validateConfirmPassword]