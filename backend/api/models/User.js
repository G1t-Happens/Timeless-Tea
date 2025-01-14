/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {

    /**
     * @description Die Email des Users
     * @type {string}
     * @example mary.sue@example.com
     */
    emailAddress: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200,
      example: 'mary.sue@example.com'
    },

    /**
     * @description Das Passwort des Users
     * @type {string}
     * @example 2$28a8eabna301089103-13948134nad
     */
    password: {
      type: 'string',
      required: true,
      description: 'Securely hashed representation of the users login password.',
      protect: true,
      example: '2$28a8eabna301089103-13948134nad'
    },

    /**
     * @description Der Vorname des Users
     * @type {string}
     * @example Daniel
     */
    firstName: {
      type: 'string',
      required: true,
      description: 'First Name of the user.',
      maxLength: 100,
      example: 'Mary Sue van der McHenst'
    },

    /**
     * @description Der Nachname des Users
     * @type {string}
     * @example Boxheimer
     */
    lastName: {
      type: 'string',
      required: true,
      description: 'Last Name of the user.',
      maxLength: 100,
      example: 'Mary Sue van der McHenst'
    },

    /**
     * @description Die Admin Flag des Users
     * @type {boolean}
     * @example true, false
     */
    isAdmin: {
      type: 'boolean',
      description: 'Whether this user is a "admin" with extra permissions, etc.',
    },

    /**
     * @description Die zugehoerigen Bestellungen eines Users
     * @type {string}
     * @example id: 1, 3, 7
     */
    orders: {
      collection: 'order',
      via: 'user',
      description: 'The orders associated with this user.'
    },

    /**
     * @description Die zugehoerige Adresse eines Users
     * @type {string}
     * @example id: 1
     */
    address: {
      model: 'address',
      required: true,
      description: 'The address associated with this user.'
    },

    /**
     * @description Die zugehoerigen hinterlegten Zahlungsmethoden eines Users
     * @type {string}
     * @example id: 1, 3, 99
     */
    payments: {
      collection: 'payment',
      via: 'user',
      description: 'The payment informations associated with this user.'
    }
  },
};
