/**
 * Order.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {

    /**
     * @description Gibt den Gesamtbeitrag einer Bestellung an
     * @type {number}
     * @example 99.99
     */
    totalAmount: {
      type: 'number',
      required: true,
      example: 99.99
    },

    /**
     * @description Gibt den Status einer Bestellung an
     * @type {string}
     * @example open, failed, ...
     */
    orderStatus: {
      type: 'string',
      required: true,
      isIn: ['open', 'processing', 'failed', 'successful', 'refunded', 'canceled'],
      example: 'processing'
    },

    /**
     * @description Ordnet Artikel der Bestellung zu
     * @type {string}
     * @example id: 2, 5, 8
     */
    orderProducts: {
      collection: 'orderproduct',
      via: 'order'
    },

    /**
     * @description Ordnet den User der Bestellung zu
     * @type {string}
     * @example id: 2
     */
    user: {
      model: 'user',
      required: true,
      description: 'The user who placed this order.'
    },

    /**
     * @description Ordnet die Versanddaten der Bestellung zu
     * @type {string}
     * @example id: 2
     */
    shipping: {
      model: 'shipping',
      description: 'The shipping information associated with this order.'
    },

    /**
     * @description Ordnet die gewaehlte Zahlungsmethode der Bestellung zu
     * @type {string}
     * @example id: 2
     */
    payment: {
      model: 'payment',
      description: 'The payment information associated with this order.'
    }
  },
};
