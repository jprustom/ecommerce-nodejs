const path = require('path');
const csrf=require('csurf');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash=require('connect-flash')
const errorController = require('./controllers/error');
const User = require('./models/user');
require('dotenv').config()
const MONGODB_URI =
  'mongodb+srv://jeanpaulrustom:Jeanpaul1999rLUFFY79153043@jpcluster.lv3bz.mongodb.net/shop';
const csrfProtection=csrf();
const app = express();
const multer=require('multer')
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const multerStorage=multer.diskStorage({
  destination:(req,file,cb)=>{cb(null,path.join('public','images'))},
  filename:(req,file,cb)=>{cb(null,Date.now()+'_'+file['originalname'])}
})
const fileFilter=(req,file,cb)=>{
  if (!file.mimetype.includes('image'))
    return cb(null,false)
  cb(null,true)
}
app.use(multer({storage:multerStorage,fileFilter}).single('imageUrl'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(flash())
app.use(csrfProtection);
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {throw new Error(err)});
});
app.use((req,res,next)=>{
  res.locals.csrfToken=req.csrfToken();
  res.locals.isAuthenticated=req.session.isLoggedIn
  next()
})
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorController.get500)
app.use(errorController.get404);
mongoose
  .connect(MONGODB_URI,{useNewUrlParser: true ,useUnifiedTopology:true,useFindAndModify:false})
  .then(result => {
    console.log('listening on port 3000')
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
