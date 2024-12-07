// ProductRating.js - Join Table
module.exports = {
  attributes: {
    product: {
      model: 'product',
      required: true
    },
    rating: {
      model: 'rating',
      required: true
    }
  }
};
