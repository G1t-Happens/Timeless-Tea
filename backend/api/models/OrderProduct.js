/**
 * OrderProduct.js
 *
 * @description :: A model definition represents a join table for orders and products.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    /**
     * @description Die Bestellung
     * @type {number}
     * @example Id: 22
     */
    order: {
      model: 'order',
      required: true,
      description: 'The order that contains the product(s).'
    },

    /**
     * @description Das Product
     * @type {number}
     * @example Id: 3
     */
    product: {
      model: 'product',
      required: true,
      description: 'The product that is part of the order.'
    },

    /**
     * @description Die Menge des Produkts in der Bestellung
     * @type {number}
     * @example Für Productbestellung
     */
    quantity: {
      type: 'number',
      required: true,
      min: 1,
      max: 1000,
      custom: (value) => Number.isInteger(value), // Akzeptiert nur Ganzzahlen
      example: 5
    }
  },
};
