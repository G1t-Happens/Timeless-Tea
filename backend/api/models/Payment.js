/**
 * Payment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    iban: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 34,
      example: 'DE89370400440532013000'
    },

    paymentOption: {
      type: 'string',
      required: true,
      isIn: ['credit card', 'bank transfer', 'paypal'],
      example: 'credit card'
    },

    currency: {
      type: 'string',
      required: true,
      maxLength: 3,
      example: 'EUR'
    },

    user: {
      model: 'user',
      unique: true,
      required: true,
      description: 'The user associated with this payment information.'
    },

    order: {
      model: 'order',
      unique: true,
      description: 'The order associated with this payment information.'
    }


  },
};
