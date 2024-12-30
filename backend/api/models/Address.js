/**
 * Address.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    country: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: 'Germany'
    },

    state: {
      type: 'string',
      maxLength: 200,
      example: 'Bavaria'
    },

    city: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: 'Munich'
    },

    postalCode: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: '80331'
    },

    street: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: 'Marienplatz'
    },

    houseNumber: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: '15'
    },

    addressAddition: {
      type: 'string',
      maxLength: 200,
      example: 'Apartment 4B'
    },

  },
};
