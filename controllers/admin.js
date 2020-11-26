const {Product} = require('../models/product');
const axios=require('axios')
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage:null
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  if (!imageUrl){
    return res.status(422).render('admin/edit-product',{
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage:'file not an image',
      product: product,
      isAuthenticated: req.session.isLoggedIn
    })
  }
  // product.imageUrl=imageUrl.path.replace('public/','/')
  product.imageUrl=(imageUrl.path.replace('public\\','/').replace('\\','/'))
  console.log(product.imageUrl)
  product
    .save()
    .then(result => {
      // console.log(result);
      res.redirect('/admin/products');
    })
    .catch(err => {
      res.redirect('/500');
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findOne({_id:prodId,userId:req.session.user._id})
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      console.log(product)
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        errorMessage:null,
        editing: editMode,
        product,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {res.redirect('/500');});
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.file;
  const updatedDesc = req.body.description;

  Product.findOne({_id:prodId,userId:req.session.user._id})
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if (updatedImageUrl)
          product.imageUrl=(updatedImageUrl.path.replace('public\\','/').replace('\\','/'))
      return product.save();
    })
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err)
      res.redirect('/500');
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.session.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {res.redirect('/500');});
};

exports.deleteProduct = async (req, res, next) => {
  try{
      const prodId = req.params.productId;
      await Product.findByIdAndRemove(prodId);
      console.log('DESTROYED PRODUCT');
      res.status(200).json({})
  }
  catch(err){
    console.log(err);
    res.redirect('/500');
  };
};
