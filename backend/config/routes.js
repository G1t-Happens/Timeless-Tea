/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

const API_BASE = '/api'; // API base prefix, change this to '/api1', '/api2', etc., as needed

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

  // LoginController.js
  [`POST ${API_BASE}/login`]: 'LoginController.login',
  [`POST ${API_BASE}/register`]: 'LoginController.register',
  [`GET ${API_BASE}/sessionUser`]: 'LoginController.sessionUser',
  [`GET ${API_BASE}/logout`]: 'LoginController.logout',

  // Benutzer-Routen
  [`GET ${API_BASE}/user/:id`]: 'UserController.findOne',
  [`GET ${API_BASE}/user`]: 'UserController.find',
  [`PATCH ${API_BASE}/user/:id`]: 'UserController.patch',
  [`DELETE ${API_BASE}/user/:id`]: 'UserController.destroy',
  [`GET ${API_BASE}/user/count`]: 'UserController.count',

  // ProductController.js
  [`POST ${API_BASE}/product`]: { controller: 'ProductController', action: 'create' },
  [`GET ${API_BASE}/product`]: 'ProductController.find',
  [`GET ${API_BASE}/product/:id`]: 'ProductController.findOne',
  [`DELETE ${API_BASE}/product/:id`]: 'ProductController.destroy',
  [`PATCH ${API_BASE}/product/:id`]: 'ProductController.patch',
  [`GET ${API_BASE}/product/count`]: 'ProductController.count',

  // CategoryController.js
  [`POST ${API_BASE}/category`]: { controller: 'CategoryController', action: 'create' },
  [`GET ${API_BASE}/category`]: 'CategoryController.find',
  [`PATCH ${API_BASE}/category/:id`]: 'CategoryController.patch',
  [`DELETE ${API_BASE}/category/:id`]: 'CategoryController.destroy',

  // OrderController.js
  [`POST ${API_BASE}/order`]: { controller: 'OrderController', action: 'create' },
  [`GET ${API_BASE}/order`]: 'OrderController.find',
  [`GET ${API_BASE}/order/:id`]: 'OrderController.findOne',
  [`GET ${API_BASE}/order/detail`]: 'OrderController.findOrdersByUser',
  [`PATCH ${API_BASE}/order/:id/cancel`]: 'OrderController.cancelOrder',
  [`GET ${API_BASE}/order/count`]: 'OrderController.count',

  // ContactMessageController.js
  [`POST ${API_BASE}/message`]: { controller: 'ContactMessageController', action: 'create' },
  [`GET ${API_BASE}/message`]: 'ContactMessageController.find',
  [`GET ${API_BASE}/message/:id`]: 'ContactMessageController.findOne',
  [`DELETE ${API_BASE}/message/:id`]: 'ContactMessageController.destroy',

  // PaymentController.js
  [`POST ${API_BASE}/payment/create`]: 'PaymentController.create',
  [`GET ${API_BASE}/payment/:userId`]: 'PaymentController.find',
  [`DELETE ${API_BASE}/payment/:id`]: 'PaymentController.destroy',
  [`PATCH ${API_BASE}/payment/:id`]: 'PaymentController.patch',

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
