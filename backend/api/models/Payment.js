/**
 * Payment.js
 *
 * @description :: A model definition for handling different payment types
 *                (credit card, bank transfer, paypal).
 */

module.exports = {
  attributes: {

    /**
     * @description Legt die Bezahlmethode fest
     * @type {string}
     * @example credit card, paypal,...
     */
    paymentOption: {
      type: 'string',
      required: true,
      isIn: ['credit card', 'bank transfer', 'paypal'],
      example: 'credit card'
    },

    /**
     * @description Legt die Iban fest fuer bank transfer
     * @type {string}
     * @example DE89370400440532013000
     */
    iban: {
      type: 'string',
      allowNull: true,   // IBAN ist nur relevant, wenn paymentOption = 'bank transfer'
      minLength: 15,
      maxLength: 34,
      description: 'IBAN bei Banküberweisung. Beispiel: DE89370400440532013000'
    },

    /**
     * @description Legt die credit card number fest fuer Kreditkartenzahlung
     * @type {string}
     * @example 1234567890123456
     */
    creditCardNumber: {
      type: 'string',
      allowNull: true,
      minLength: 13,
      maxLength: 19,
      description: 'Nur relevant bei credit card, z.B. 1234567890123456'
    },

    /**
     * @description Legt das Ablaufdatum der credit card fest
     * @type {string}
     * @example 12/27
     */
    expiryDate: {
      type: 'ref',
      columnType: 'date',
      description: 'Speicher als YYYY-MM-DD'
    },

    /**
     * @description Legt die Kreditkartenpruefnummer fest (CVC)
     * @type {string}
     * @example 123
     */
    cvc: {
      type: 'string',
      allowNull: true,
      minLength: 3,
      maxLength: 4,
      description: 'Nur relevant bei credit card, z.B. "123"'
    },

    /**
     * @description Legt die paypal mail fest
     * @type {string}
     * @example user@paypal.com
     */
    paypalEmail: {
      type: 'string',
      allowNull: true,
      isEmail: true,
      maxLength: 100,
      description: 'Nur relevant bei PayPal, z.B. user@paypal.com'
    },

    /**
     * @description Legt fest ob Payment Eintrag fuer User hinterlegt oder fuer Order hinterlegt,
     * da wir eine strikte Datentrennung brauchen -> Snapshot Daten fuer Bestellung
     * @type {boolean}
     * @example true, false
     */
    isForOrder: {
      type: 'boolean',
      required: true,
      description: 'Ob dieses Payment für eine Order erstellt wurde oder User(strikte Trennung).'
    },

    /**
     * @description Der User der das Payment hinterlegt/erstellt hat
     * @type {string}
     * @example id: 3
     */
    user: {
      model: 'user',
      required: true,
      description: 'User zu dem dieses Payment gehört.'
    },

    /**
     * @description Die Order die zu dieser Bezahlmethode gehoert
     * @type {string}
     * @example id: 3
     */
    order: {
      model: 'order',
      unique: true,
      description: 'Die zugehörige Order.'
    }
  },
};
