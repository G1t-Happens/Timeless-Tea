/**
 * Shipping.js
 *
 * @description :: A model definition represents a database table/collection for shipping information.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {

    /**
     * @description Der Lieferdienst
     * @type {string}
     * @example DHL, Hermes
     */
    carrier: {
      type: 'string',
      required: true,
      maxLength: 50,
      example: 'DHL'
    },

    /**
     * @description Der Status einer Lieferung
     * @type {string}
     * @example shipped, delivered,..
     */
    deliveryStatus: {
      type: 'string',
      required: true,
      isIn: ['not shipped', 'shipped', 'delivered'],
      example: 'shipped'
    },

    /**
     * @description Das geschaetzte Ankunftsdatum der Lieferung
     * @type {date}
     * @example 2025-01-16
     */
    estimatedDeliveryDate: {
      type: 'ref',
      columnType: 'date',
      description: 'The estimated delivery date in YYYY-MM-DD format.',
    },

    /**
     * @description Das Lieferdatum
     * @type {date}
     * @example 2025-01-12
     */
    shippingDate: {
      type: 'ref',
      columnType: 'date',
      description: 'The shipping date in YYYY-MM-DD format.',
    },

    /**
     * @description Die Bestellung zu dem diese Shipping Daten gehoeren
     * @type {string}
     * @example id: 2
     */
    order: {
      model: 'order',
      unique: true,
      description: 'The order associated with this shipping information.'
    },

    /**
     * @description Die Versandaddresse wohin geliefert wird
     * @type {string}
     * @example id: 2
     */
    address: {
      model: 'address',
      required: true,
      description: 'The address associated with this shipping information.'
    }
  },
};
