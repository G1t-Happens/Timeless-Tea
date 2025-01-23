/**
 * OrderController
 *
 * @description :: Server-side actions for handling incoming requests related to Orders.
 *                 Dieser Controller kümmert sich um das Routing und verwendet den Service,
 *                 um Bestellungen zu verwalten.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/actions
 */
const errors = require('../utils/errors');

module.exports = {

  /**
   * Erstellt eine neue Bestellung
   *
   * @description
   * Diese Aktion ruft den entsprechenden Service auf, um eine neue Bestellung zu erstellen.
   * Bei Erfolg wird die ID der neu erstellten Bestellung zurückgegeben.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit den Bestelldaten im Body.
   * @param {Response} res - Der HTTP-Response mit dem Ergebnis der Operation.
   * @returns {Response} 201 Created mit der Bestell-ID oder ein Fehlerstatus.
   */
  create: async function (req, res) {
    try {
      const createdOrder = await OrderService.createOrder(req);
      return res.status(201).json(createdOrder);
    } catch (error) {
      sails.log.error('Error creating order:', error);
      if (error instanceof errors.CustomError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.serverError({ error: 'An error occurred while creating the order.' });
    }
  },

  /**
   * Ruft eine Liste von Bestellungen ab
   *
   * @description
   * Diese Aktion ruft den entsprechenden Service auf, um Bestellungen basierend auf
   * optionalen Such- und Pagination-Parametern zu laden.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit den Query-Parametern für die Suche.
   * @param {Response} res - Der HTTP-Response mit der Liste der gefundenen Bestellungen.
   * @returns {Response} 200 OK mit der Liste der Bestellungen oder ein Fehlerstatus.
   */
  find: async function (req, res) {
    try {
      const orders = await OrderService.findOrders(req);
      return res.json(orders);
    } catch (error) {
      sails.log.error('Error fetching orders:', error);
      if (error instanceof errors.CustomError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.serverError({ error: 'An error occurred while fetching orders.' });
    }
  },

  /**
   * Ruft eine einzelne Bestellung anhand ihrer ID ab
   *
   * @description
   * Diese Aktion ruft den entsprechenden Service auf, um eine spezifische Bestellung
   * und deren Details basierend auf der übergebenen ID zu laden.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Bestell-ID in `req.params.id`.
   * @param {Response} res - Der HTTP-Response mit den Bestelldetails.
   * @returns {Response} 200 OK mit den Bestelldetails oder ein Fehlerstatus.
   */
  findOne: async function (req, res) {
    try {
      const order = await OrderService.findOrderById(req);
      return res.json(order);
    } catch (error) {
      sails.log.error('Error fetching order details:', error);
      if (error instanceof errors.CustomError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.serverError({ error: 'An error occurred while fetching order details.' });
    }
  },

  /**
   * Ruft alle Bestellungen eines Benutzers ab
   *
   * @description
   * Diese Aktion ruft den entsprechenden Service auf, um alle Bestellungen des aktuell
   * authentifizierten session Users zu laden.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Benutzer-ID in der Session.
   * @param {Response} res - Der HTTP-Response mit der Liste der Bestellungen des Benutzers.
   * @returns {Response} 200 OK mit den Benutzerbestellungen oder ein Fehlerstatus.
   */
  findOrdersByUser: async function (req, res) {
    try {
      const orders = await OrderService.findOrdersByUser(req);
      return res.ok(orders);
    } catch (error) {
      sails.log.error('Error fetching user orders:', error);
      if (error instanceof errors.CustomError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.serverError({ error: 'An error occurred while fetching user orders.' });
    }
  },

  /**
   * Storniert eine Bestellung
   *
   * @description
   * Diese Aktion ruft den entsprechenden Service auf, um eine Bestellung des aktuell
   * authentifizierten Benutzers zu stornieren, sofern dies zulässig ist.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Bestell-ID in `req.params.id`.
   * @param {Response} res - Der HTTP-Response mit der aktualisierten Bestellung.
   * @returns {Response} 200 OK mit der aktualisierten Bestellung oder ein Fehlerstatus.
   */
  cancelOrder: async function (req, res) {
    try {
      const updatedOrder = await OrderService.cancelOrder(req);
      return res.ok(updatedOrder);
    } catch (error) {
      sails.log.error('Error canceling order:', error);
      if (error instanceof errors.CustomError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.serverError({ error: 'An error occurred while canceling the order.' });
    }
  },

  /**
   * Zählt alle Bestellungen und kategorisiert sie nach ihrem Status (Metadaten fuer Dashboard)
   *
   * @description
   * Diese Aktion ruft den entsprechenden Service auf, um die Gesamtzahl der Bestellungen
   * sowie die Anzahl abgeschlossener und aktiver Bestellungen zu berechnen.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Der HTTP-Response mit den Bestellstatistiken.
   * @returns {Response} 200 OK mit den Bestellstatistiken oder ein Fehlerstatus.
   */
  count: async function (req, res) {
    try {
      const counts = await OrderService.countOrders();
      return res.json(counts);
    } catch (error) {
      sails.log.error('Error fetching order counts:', error);
      if (error instanceof errors.CustomError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.serverError({ error: 'An error occurred while fetching order counts.' });
    }
  }

};
