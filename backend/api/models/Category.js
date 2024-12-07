/**
 * Category.js
 */
module.exports = {

  attributes: {

    name: {
      type: 'string',
      columnType: 'varchar(80)',
      required: true
    },


    type: {
      type: 'string',
      columnType: 'varchar(80)',
      required: true
    },


    label: {
      type: 'string',
      columnType: 'varchar(256)'
    },

    productCategories: {
      collection: 'productcategory',
      via: 'category'
    }

  }

};
