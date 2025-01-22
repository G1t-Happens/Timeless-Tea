/**
 * PaymentController
 *
 * @description :: Server-side actions for handling incoming requests related to payments.
 *                 Dieser Controller kümmert sich um das Routing und verwendet den Service,
 *                 um die Zahlungsmethoden aus der Datenbank abzurufen.
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
    const { paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail, user } = req.body;
    const sessionUserId = req.session.userId;

    //Man darf nur fuer sich selbst Payments adden, ausser man ist ein Admin
    if (Number(sessionUserId) !== Number(user) && !req.session.user.isAdmin) {
      return errors.ForbiddenError('Not allowed to add payment for this user.');
    }

    try {
      // Erstelle das Payment-Objekt per PaymentService
      const newPayment = await PaymentService.createPayment({
        paymentOption,
        iban,
        creditCardNumber,
        expiryDate,
        cvc,
        paypalEmail,
        user
      });
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
    const userId = req.params.userId;
    const sessionUserId = req.session.userId;

    // Autorisierung: Gehört das gesuchte Payment dem eingeloggten User oder ist er Admin?
    if (Number(sessionUserId) !== Number(userId) && !req.session.user.isAdmin) {
      return errors.ForbiddenError('Not allowed to find payment for this user.');
    }

    try {
      // Finde alle Zahlungen, die mit diesem Benutzer verknüpft sind per PaymentService
      const payments = await PaymentService.findByUserId({ userId });
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
    const id = req.params.id;
    const sessionUserId = req.session.userId;
    const { paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail } = req.body;

    try {
      // Lade die vorhandene Payment-Entität
      const payment = await Payment.findOne({ id });
      if (!payment) {
        // Falls es die Payment-ID nicht gibt, direkt 404 liefern ohne weitere Verarbeitungsschritte
        return res.notFound({ error: 'Payment not found.' });
      }

      // Autorisierung: Gehört das Payment dem eingeloggten User oder ist er Admin?
      if (Number(payment.user) !== Number(sessionUserId) && !req.session.user.isAdmin) {
        // Falls nicht, 403 direkt liefern ohne weitere Verarbeitungsschritte
        return res.forbidden({ error: 'Not allowed to update this payment.' });
      }

      // Falls alles ok, Daten an den Service übergeben und dort weiter bearbeiten
      const updatedPayment = await PaymentService.updatePayment({
        oldPayment: payment,
        paymentOption,
        iban,
        creditCardNumber,
        expiryDate,
        cvc,
        paypalEmail
      });
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
    const id = req.params.id;
    const sessionUserId = req.session.userId;

    try {
      // Finde das Payment-Objekt
      const payment = await Payment.findOne({ id });

      // Autorisierung: Gehört das Payment dem eingeloggten User oder ist er Admin?
      if (Number(payment.user) !== Number(sessionUserId) && !req.session.user.isAdmin) {
        return res.forbidden({ error: 'Not allowed to delete this payment.' });
      }

      const deletedPayment = await PaymentService.deletePayment({ id });
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
