// ProductRating.js
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
