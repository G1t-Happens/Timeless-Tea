/**
 * Address.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    /**
     * @description Das Land
     * @type {string}
     * @example Germany
     */
    country: {
      type: 'string',
      required: true,
      maxLength: 200,
      example: 'Germany'
    },

    /**
     * @description Bundesland
     * @type {string}
     * @example Bavaria
     */
    state: {
      type: 'string',
      maxLength: 50,
      example: 'Bavaria'
    },

    /**
     * @description Stadt
     * @type {string}
     * @example Munich
     */
    city: {
      type: 'string',
      required: true,
      maxLength: 50,
      example: 'Munich'
    },

    /**
     * @description Postleitzahl
     * @type {string}
     * @example 78224
     */
    postalCode: {
      type: 'string',
      required: true,
      maxLength: 20,
      example: '80331'
    },

    /**
     * @description Strasse
     * @type {string}
     * @example Marienplatz
     */
    street: {
      type: 'string',
      required: true,
      maxLength: 50,
      example: 'Marienplatz'
    },

    /**
     * @description Hausnummer
     * @type {string}
     * @example 15
     */
    houseNumber: {
      type: 'string',
      required: true,
      maxLength: 10,
      example: '15'
    },

    /**
     * @description Adresszusatzinfo
     * @type {string}
     * @example Apartment 4B
     */
    addressAddition: {
      type: 'string',
      maxLength: 200,
      example: 'Apartment 4B'
    },
  },
};
