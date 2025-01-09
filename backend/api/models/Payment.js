/**
 * Payment.js
 *
 * @description :: A model definition for handling different payment types
 *                (credit card, bank transfer, paypal).
 */

module.exports = {
  attributes: {

    /**
     * paymentOption
     * "credit card", "bank transfer" oder "paypal"
     */
    paymentOption: {
      type: 'string',
      required: true,
      isIn: ['credit card', 'bank transfer', 'paypal'],
      example: 'credit card'
    },

    /**
     * Felder für Banküberweisung
     */
    iban: {
      type: 'string',
      allowNull: true,   // IBAN ist nur relevant, wenn paymentOption = 'bank transfer'
      description: 'IBAN bei Banküberweisung. Beispiel: DE89370400440532013000'
    },

    /**
     * Felder für Kreditkarte
     */
    creditCardNumber: {
      type: 'string',
      allowNull: true,
      description: 'Nur relevant bei credit card, z.B. 1234567890123456'
    },

    expiryDate: {
      type: 'string',
      allowNull: true,
      description: 'Nur relevant bei credit card, z.B. "12/24"'
    },

    cvc: {
      type: 'string',
      allowNull: true,
      description: 'Nur relevant bei credit card, z.B. "123"'
    },

    /**
     * Felder für PayPal
     */
    paypalEmail: {
      type: 'string',
      allowNull: true,
      isEmail: true,
      description: 'Nur relevant bei PayPal, z.B. user@paypal.com'
    },

    /**
     * Besitzer dieser Payment-Daten
     * unique: true => Ein User kann nur genau EIN Payment haben
     */
    user: {
      model: 'user',
      unique: true,
      required: true,
      description: 'User zu dem dieses Payment gehört.'
    },

    /**
     * Optional: Falls du Payment-Daten auch direkt an eine Order knüpfen willst
     */
    order: {
      model: 'order',
      unique: true,
      description: 'Die zugehörige Order, falls direkt verknüpft.'
    }

  },
};
