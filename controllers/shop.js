const {PRODUCTS_NUMBER_PER_PAGE,Product}=require('../models/product.js');
const Order = require('../models/order');
const path=require('path')
const fs=require('fs');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      res.redirect('/500');
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err =>{res.redirect('/500');});
};


exports.getIndex =async (req, res, next) => {
  try{
      const currentPageNumber=+req.query.page || 1;
      const paginationConfig=await Product.generatePaginationConfig(currentPageNumber);
      const productsToDisplay=await Product.getAtPageNumber(currentPageNumber);

      res.render('shop/index', {
        prods: productsToDisplay,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
        ...paginationConfig
      })
    }
  catch(err){
    console.log(err)
    res.redirect('/500');
  }
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err=>{
      res.redirect('/500');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      console.log('populated cart items')
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save()
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {res.redirect('/500');});
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {res.redirect('/500');});
};
exports.getInvoice=function(req,res,next){
  const orderId=req.params.orderId;
  const orderPath=path.join('invoices',`invoice-${orderId}.pdf`);
  fs.readFile(orderPath,function(err,data){
    if (err)
      next(err);
    res.setHeader('Content-Type','application/pdf');
    res.send(data)
  })

}