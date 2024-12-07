// Product.js
module.exports = {
  attributes: {
    name: { type: 'string', columnType: 'varchar(80)', required: true },
    description: { type: 'string', columnType: 'varchar(256)' },
    price: { type: 'number', columnType: 'decimal(10,2)', required: true },
    image: { type: 'string', columnType: 'varchar(255)' },
    reviews: { type: 'number', columnType: 'integer'},
    productRatings: {
      collection: 'productrating',
      via: 'product'
    },
    productCategories: {
      collection: 'productcategory',
      via: 'product'
    }
  }
};
