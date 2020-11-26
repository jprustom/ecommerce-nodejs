const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PRODUCTS_NUMBER_PER_PAGE=2;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});
productSchema.statics.generatePaginationConfig=async function (currentPageNumber){
  const totalProductsNumber=await Product.find().countDocuments();
  const lastPageNumber=Math.ceil(totalProductsNumber/PRODUCTS_NUMBER_PER_PAGE);
  return {
    lastPageNumber,
    previousPageNumber:currentPageNumber===1?null : currentPageNumber-1,
    nextPageNumber:currentPageNumber===lastPageNumber?null:currentPageNumber+1,
    currentPageNumber
  }
}
productSchema.statics.getAtPageNumber=async function(currentPageNumber){
  return await Product.find().skip((currentPageNumber-1)*PRODUCTS_NUMBER_PER_PAGE)
                              .limit(PRODUCTS_NUMBER_PER_PAGE)
}
const Product=mongoose.model('Product', productSchema)
module.exports = {
  Product,
  PRODUCTS_NUMBER_PER_PAGE
}
