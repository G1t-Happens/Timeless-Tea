/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  //Globale Standard-Policy
  '*': 'isLoggedIn',

  UserController: {
    patch: 'isOwnerOrAdmin',
    destroy: 'isAdmin',
    find: 'isAdmin',
    findOne: 'isOwnerOrAdmin',
  },

  LoginController:{
    '*': true,
  },

  ProductController:{
    '*': 'isAdmin',
    findOne: true,
    find: true,
  },

  CategoryController: {
    create: 'isAdmin',
    patch: 'isAdmin',
    destroy: 'isAdmin',
    find: true
  },

  OrderController: {
    find: 'isAdmin',
    findOne: 'isAdmin',
    count: 'isAdmin',
    patchStatus: 'isAdmin',
    patchShipping: 'isAdmin',
    patchDeliveryAddress: 'isAdmin',
    patchPayment: 'isAdmin',
  },

  ContactMessageController: {
    find: 'isAdmin',
    findOne: 'isAdmin',
    destroy: 'isAdmin',
    create: true
  },
};
