/**
 * Order.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    totalAmount: {
      type: 'number',
      required: true,
      example: 99.99
    },

    orderDate: {
      type: 'string',
      columnType: 'datetime',
      required: true,
      example: '2024-01-10 14:30:00'
    },

    orderStatus: {
      type: 'string',
      required: true,
      isIn: ['open', 'processing', 'failed', 'successful', 'refunded'],
      example: 'processing'
    },

    /**
     * @description Beziehung zu OrderProducts, um Produkte zu verknüpfen (Many-to-Many).
     * Ein Bestellung kann mehrere Produkte haben
     */
    orderProducts: {
      collection: 'orderproduct',
      via: 'order'
    },

    user: {
      model: 'user',
      required: true,
      description: 'The user who placed this order.'
    },

    shipping: {
      model: 'shipping',
      description: 'The shipping information associated with this order.'
    },

    payment: {
      model: 'payment',
      required: true,
      description: 'The payment information associated with this order.'
    }

  },
};
