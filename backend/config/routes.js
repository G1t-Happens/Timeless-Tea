/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/
  '/': { view: 'pages/homepage' },

  //LoginController.js
  'POST /login': 'LoginController.login',
  'POST /register': 'LoginController.register',
  'GET /sessionUser': 'LoginController.sessionUser',
  'GET /logout': 'LoginController.logout',

  // Benutzer-Routen
  'GET /user/:id': 'UserController.findOne',
  'GET /user': 'UserController.find',
  'PATCH /user/:id': 'UserController.patch',
  'DELETE /user/:id': 'UserController.destroy',
  'GET /user/count': 'UserController.count',

  //ProductController.js
  'POST /product': { controller: 'ProductController', action: 'create' },
  'GET /product': 'ProductController.find',
  'GET /api/product/:id': 'product.findOne',
  'DELETE /product/:id': 'product.destroy',
  'PATCH /product/:id': 'product.patch',
  'GET /product/count': 'ProductController.count',

  //CategoryController.js
  'POST /category': { controller: 'CategoryController', action: 'create' },
  'GET /category': 'CategoryController.find',

  //OrderController.js
  'POST /order': { controller: 'OrderController', action: 'create' },
  'GET /order': 'OrderController.find',
  'GET /order/:id': 'OrderController.findOne',
  'GET /order/detail': 'OrderController.findOrdersByUser',
  'PATCH /order/:id/cancel': 'OrderController.cancelOrder',
  'GET /order/count': 'OrderController.count',

  //ContactMessageController.js
  'POST /message': { controller: 'ContactMessageController', action: 'create' },
  'GET /message': 'ContactMessageController.find',
  'GET /message/:id': 'ContactMessageController.findOne',
  'DELETE /message/:id': 'ContactMessageController.destroy',

  //PaymentController.js
  'POST /payment/create': 'PaymentController.create',
  'GET /payment/:userId': 'PaymentController.findPaymentsByUser',
  'DELETE /payment/:id': 'PaymentController.destroy',
  'PATCH /payment/:id': 'PaymentController.updatePayment',


  // Catch-All-Route für Vue SPA
  '/*': {
    skipAssets: true,
    fn: function (req, res) {
      return res.sendFile(sails.config.appPath + '/assets/index.html');
    },
  },



  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/


};
