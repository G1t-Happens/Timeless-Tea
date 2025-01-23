/**
 * PaymentController
 *
 * @description :: Server-side actions for handling incoming requests related to payments.
 *                 Dieser Controller kümmert sich um das Routing und verwendet den Service,
 *                 um die Zahlungsmethoden zu verwalten.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/actions
 */
const errors = require('../utils/errors');

module.exports = {

  /**
   * `PaymentController.create()`
   *
   * @description
   * Erstellt eine neue Zahlungsmethode über den Service und gibt sie zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Die HTTP-Response, um die Zahlungsmethode und Antwort zurückzugeben.
   * @returns {Response} Die erstellte Zahlungsmethode oder ein Serverfehler.
   */
  create: async function(req, res) {
    try {
      // Erstelle das Payment-Objekt per PaymentService
      const newPayment = await PaymentService.createPayment(req);
      return res.status(201).json(newPayment);

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * `PaymentController.find()`
   *
   * @description
   * Findet Zahlungsmethoden anhand der userId über den Service und gibt sie zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Die HTTP-Response, um die Zahlungsmethoden zurückzugeben.
   * @returns {Response} Die gefundend Zahlungsmethode oder ein Serverfehler.
   */
  find: async function(req, res) {
    try {
      // Finde alle Zahlungen, die mit diesem Benutzer verknüpft sind per PaymentService
      const payments = await PaymentService.findByUserId(req);
      return res.ok(payments);

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * `PaymentController.updatePayment()`
   *
   * @description
   * Aktualisiert eine vorhandene Zahlungsmethode.
   *
   * @param {Request} req - Eingehender HTTP-Request
   * @param {Response} res - HTTP-Response
   * @returns {Response} Die aktualisierte Zahlungsmethode oder ein passender Fehler
   */
  patch: async function (req, res) {
    try {
      // Falls alles ok, Daten an den Service übergeben und dort weiter bearbeiten
      const updatedPayment = await PaymentService.updatePayment(req);
      return res.ok(updatedPayment);

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * `PaymentController.destroy()`
   *
   * @description
   * Loescht eine vorhandene Zahlungsmethode anhand der id.
   *
   * @param {Request} req - Eingehender HTTP-Request
   * @param {Response} res - HTTP-Response
   * @returns {Response} Status 200 oder ein passender Fehler
   */
  destroy: async function(req, res) {
    try {
      const deletedPayment = await PaymentService.deletePayment(req);
      return res.ok(deletedPayment);

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  }
};
