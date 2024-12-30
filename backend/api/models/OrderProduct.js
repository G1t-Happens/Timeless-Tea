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
      description: 'The product that is part of the order.'
    },

    quantity: {
      type: 'number',
      required: true,
      description: 'The quantity of the product in the order.',
      example: 2
    },

    priceAtPurchase: {
      type: 'number',
      required: true,
      description: 'The price of the product at the time of purchase.',
      example: 29.99
    },

  },
};
