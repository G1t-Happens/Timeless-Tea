/**
 * OrderProduct.js
 *
 * @description :: A model definition represents a join table for orders and products.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    order: {
      model: 'order',
      required: true,
      description: 'The order that contains the product.'
    },

    product: {
      model: 'product',
      required: true,
      description: 'The product that is part of the order.'
    }

  },
};
