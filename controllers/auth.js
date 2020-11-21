const User = require('../models/user');
const bcrypt=require("bcryptjs");
const crypto=require('crypto')
const mongoose=require('mongoose')
const sgMail = require('@sendgrid/mail')
const {validationResult}=require('express-validator');


sgMail.setApiKey(process.env.SENDGRID_API_KEY)
exports.getLogin = (req, res, next) => {
  
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage:req.flash('error')
  });
};

exports.getSignup = (req, res, next) => {

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage:req.flash('error')
  });
};

exports.postLogin = (req, res, next) => {
  const email=req.body.email;
  const password=req.body.password;
  User.findOne({
    email
  })
    .then(user => {
      if (!user){
        req.flash('error','invalid username or password')
        return res.redirect('/login');
      }
      bcrypt.compare(password,user.password)
        .then(
          doPasswordsMatch=>{
            if (!doPasswordsMatch){
              req.flash('error','invalid username or password')
              res.redirect('/login');
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
        )
        .catch((err)=>{
          console.log(err)
          res.redirect('/')
        })
      
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const validationErrors=validationResult(req)
  if (!validationErrors.isEmpty()){
    console.log(validationErrors.array())
    return res.status(422).render('auth/signup',{
      path:'signup',
      pageTitle:'Sign Up',
      errorMessage:validationErrors.array()[0].msg,
      isAuthenticated:false
    })
  }
  const email = req.body.email;
  const password = req.body.password;
  return bcrypt.hash(password,12)
    .then(hashedPassword=>{
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
    .then(result => {
      res.redirect('/login');
      return sgMail.send({
        to:email,
        from:'jprustom120@gmail.com',
        subject:'Signup Succeeded',
        html:'<h1>Successfully signed up</h1>',
        text:'hiiii'
      }).then(()=>{console.log('email sent')})
      .catch((err)=>{
        console.log('error while sending email')
        console.log(err.message)
      })
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err)
    console.log('destroyed')
    res.redirect('/');
  });
};
exports.getResetPassReq=function(req,res,next){
  res.render('auth/reset',{
    pageTitle:'Reset Password !',
    errorMessage:req.flash('error'),
    path:'/reset-password'
  })
}
exports.postResetPassReq=async function(req,res,next){
  const email=req.body['email'];
  console.log(email)
  const user=await User.findOne({email}).catch((err)=>{console.log(err.message)})
  if (!user){
    req.flash('error',`${email} does not exist in our database`)
    return res.redirect('/reset-password')
  }
  crypto.randomBytes(32,(error,buffer)=>{
    if (error){
      req.flash('error',error.message)
      return res.redirect('/reset-password')
    }
    res.redirect('/')
    const tokenGenerated=buffer.toString('hex')
    console.log(tokenGenerated)
    user.resetPasswordToken=tokenGenerated;
    user.resetPasswordTokenExpiryDate=Date.now()+24*60*60*1000;
    user.save();
    sgMail.send({
      to:email,
      from:'jprustom120@gmail.com',
      subject:'Reset Password',
      html:`
        <p>You requested your password to be reset</p>
        <p>Click the link below to reset your password: <a>http://localhost:3000/reset-password/${tokenGenerated}</a></p>
      `
    }).then((result)=>{console.log('password reset sent',result)})
      .catch((err)=>{console.log(err.message)})
    
  })
}
exports.getNewPassword=async function(req,res,next){
  const resetPasswordToken=req.params.token;
  console.log('token is',req.params.token)
  const user=await User.findOne({resetPasswordToken,resetPasswordTokenExpiryDate:{"$gt":Date.now()}}).catch((err)=>{console.log(err)});
  console.log('id string',user._id.toString())
  res.render('auth/resetPassword',{
    pageTitle:'Reset Password',
    path:'/new-password',
    errorMessage:req.flash('error'),
    userId:user._id.toString(),
    resetPasswordToken
  })
}
exports.postNewPassword=async function(req,res,next){
  console.log('USER ID IS',req.body['user_id'])
  const user=await User.findOne({
    _id:mongoose.Types.ObjectId(req.body['user_id']),
    resetPasswordToken:req.body['resetPasswordToken'],
    resetPasswordTokenExpiryDate:{"$gt":Date.now()}
  }).catch((err)=>{console.log(err.message)})
  if (!user){
    req.flash('error','reset password request expired');
    if (user){
      delete user.resetPasswordToken;
      delete user.resetPasswordTokenExpiryDate;
      user.save()
    }
    return res.redirect('/new-password')
  }
  const newPassword=req.body['password'];
  const hashedNewPassword=await bcrypt.hash(newPassword,12);
  user.password=hashedNewPassword;
  delete user.resetPasswordToken;
  delete user.resetPasswordTokenExpiryDate;
  user.save().catch((err)=>{console.log(err)})
  res.redirect('/login')

}
