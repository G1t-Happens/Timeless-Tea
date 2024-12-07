// Rating.js
module.exports = {
  attributes: {
    stars: { type: 'number', columnType: 'integer', required: true },
    productRatings: {
      collection: 'productrating',
      via: 'rating',
    }
  }
};
