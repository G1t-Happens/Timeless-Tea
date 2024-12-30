/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    emailAddress: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 200,
      example: 'mary.sue@example.com'
    },

    password: {
      type: 'string',
      required: true,
      description: 'Securely hashed representation of the user\'s login password.',
      protect: true,
      example: '2$28a8eabna301089103-13948134nad'
    },

    firstName: {
      type: 'string',
      required: true,
      description: 'First Name of the user.',
      maxLength: 100,
      example: 'Mary Sue van der McHenst'
    },

    lastName: {
      type: 'string',
      required: true,
      description: 'First Name of the user.',
      maxLength: 100,
      example: 'Mary Sue van der McHenst'
    },

    isAdmin: {
      type: 'boolean',
      description: 'Whether this user is a "admin" with extra permissions, etc.',
    },

  },
};

