/**
 * Shipping.js
 *
 * @description :: A model definition represents a database table/collection for shipping information.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    carrier: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: 'DHL'
    },

    deliveryStatus: {
      type: 'string',
      required: true,
      isIn: ['not shipped', 'shipped', 'delivered'],
      example: 'shipped'
    },

    estimatedDeliveryDate: {
      type: 'string',
      columnType: 'date',
      required: true,
      example: '2024-01-15'
    },

    shippingDate: {
      type: 'string',
      columnType: 'date',
      required: true,
      example: '2024-01-10'
    },

  },
};
