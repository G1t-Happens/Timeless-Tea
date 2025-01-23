/**
 * api/services/PaymentService.js
 *
 * @description :: Service zum Verwalten von Zahlungsmethoden.
 *                 Hier werden Zugriffe auf die Datenbank oder andere Business-Logik gekapselt,
 *                 die für das Erstellen, Auslesen oder Löschen von Payments benötigt wird.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/services
 */
const errors = require('../utils/errors');
module.exports = {


  /**
   * `PaymentService.createPayment()`
   *
   * @description
   * Erstellt eine neue Zahlungsmethode in der Datenbank.
   *
   * @param {object} req - Das Sails.js-Request-Objekt
   *
   * @throws {BadRequestError} Wenn eines der Pflichtfelder fehlt.
   *
   * @returns {Promise<Object>} Die neu erstellte Nachricht als Datensatz.
   */
  createPayment: async function (req) {
    const { paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail, user } = req.body;
    const sessionUserId = req.session.userId;

    //Man darf nur fuer sich selbst Payments adden, ausser man ist ein Admin
    if (Number(sessionUserId) !== Number(user) && !req.session.user.isAdmin) {
      return errors.ForbiddenError('Not allowed to add payment for this user.');
    }

    // Validierung der erforderlichen Felder
    if (!paymentOption || !user) {
      return errors.BadRequestError('Payment option and user ID are required.');
    }

    if (paymentOption === 'bank transfer' && !iban) {
      return errors.BadRequestError('IBAN is required for bank transfers.');
    }

    if (paymentOption === 'credit card' && (!creditCardNumber || !expiryDate || !cvc)) {
      return errors.BadRequestError('Credit card details (number, expiry date, and CVC) are required.');
    }

    if (paymentOption === 'paypal' && !paypalEmail) {
      return errors.BadRequestError('PayPal email is required for PayPal payments.');
    }

    const newPayment = await Payment.create({
      paymentOption,
      iban: paymentOption === 'bank transfer' ? iban : null,
      creditCardNumber: paymentOption === 'credit card' ? creditCardNumber : null,
      expiryDate: paymentOption === 'credit card' ? expiryDate : null,
      cvc: paymentOption === 'credit card' ? cvc : null,
      paypalEmail: paymentOption === 'paypal' ? paypalEmail : null,
      isForOrder: false, // Unterscheidung zw. User und Orderpayments fuer Datenkonsistenz, falls User Payment changed(Order snapshot)
      user: user
    }).fetch();

    // Adde die aktuelle Zahlungsmethode auf User Seite
    await User.addToCollection(user, 'payments', newPayment.id);
    return newPayment;
  },

  /**
   * `PaymentService.findByUserId()`
   *
   * @description
   * Sucht nach den Zahlungsmethode Zahlungsmethoden des jeweiligen Nutzers.
   *
   * @param {object} req - Das Sails.js-Request-Objekt
   *
   * @returns {Promise<Object>} Alle Userspezifischen Payment-Objekt aus der DB.
   */
  findByUserId: async function (req) {
    const userId = req.params.userId;
    const sessionUserId = req.session.userId;

    // Autorisierung: Gehört das gesuchte Payment dem eingeloggten User oder ist er Admin?
    if (Number(sessionUserId) !== Number(userId) && !req.session.user.isAdmin) {
      return errors.ForbiddenError('Not allowed to find payment for this user.');
    }

    // In der Daten nach allen Payments anhand des Users suchen
    const payments = await Payment.find({ user: id });

    //Falls keine vorhanden -> 404
    if (!payments) {
      return errors.NotFoundError('No payments found for this user.');
    }
    return payments;
  },

  /**
   * `PaymentService.updatePayment()`
   *
   * @description
   * Aktualisiert eine vorhandene Zahlungsmethode.
   * Setzt Felder nur dann neu, wenn eine bestimmte `paymentOption` dies erfordert.
   *
   * @param {object} req - Das Sails.js-Request-Objekt
   *
   * @returns {Promise<Object>} Das aktualisierte Payment-Objekt aus der DB.
   */
  updatePayment: async function (req) {
    const id = req.params.id;
    const sessionUserId = req.session.userId;
    const { paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail } = req.body;

    // Lade die vorhandene Payment-Entität
    const payment = await Payment.findOne({ id });
    if (!payment) {
      // Falls es die Payment-ID nicht gibt, direkt 404 liefern ohne weitere Verarbeitungsschritte
      return errors.NotFoundError('Payment not found.' );
    }

    // Autorisierung: Gehört das Payment dem eingeloggten User oder ist er Admin?
    if (Number(payment.user) !== Number(sessionUserId) && !req.session.user.isAdmin) {
      // Falls nicht, 403 direkt liefern ohne weitere Verarbeitungsschritte
      return errors.ForbiddenError('Not allowed to update this payment.');
    }

    // Business Logik zur Ausführung des Updates
    const updatedPayment = await Payment.updateOne({ id }).set({
      paymentOption,
      iban: paymentOption === 'bank transfer' ? iban : payment.iban,
      creditCardNumber: paymentOption === 'credit card' ? creditCardNumber : payment.creditCardNumber,
      expiryDate: paymentOption === 'credit card' ? expiryDate : payment.expiryDate,
      cvc: paymentOption === 'credit card' ? cvc : payment.cvc,
      paypalEmail: paymentOption === 'paypal' ? paypalEmail : payment.paypalEmail
    });

    if (!updatedPayment) {
      // Falls das Update schiefgegangen oder der Datensatz in der Zwischenzeit gelöscht wurde
      throw new errors.NotFoundError('Payment could not be updated or was not found.');
    }

    return updatedPayment;
  },

  /**
   * `PaymentService.deletePayment()`
   *
   * @description
   * Loescht eine Zahlungsmethode anhand der Payment id.
   *
   * @param {object} req - Das Sails.js-Request-Objekt
   *
   * @returns {Promise<Object>} Das aktualisierte Payment-Objekt aus der DB.
   */
  deletePayment: async function (req) {
    const id = req.params.id;
    const sessionUserId = req.session.userId;

    // Finde das Payment-Objekt
    const payment = await Payment.findOne({ id });

    // Autorisierung: Gehört das Payment dem eingeloggten User oder ist er Admin?
    if (Number(payment.user) !== Number(sessionUserId) && !req.session.user.isAdmin) {
      return errors.ForbiddenError('Not allowed to delete this payment.');
    }

    // Business Logik zur Ausführung des Updates
    const deletedPayment = await Payment.destroy({ id }).fetch();

    if (!deletedPayment) {
      // Falls das Update schiefgegangen oder der Datensatz in der Zwischenzeit gelöscht wurde
      throw new errors.NotFoundError('Payment could not be deleted.');
    }

    return deletedPayment;
  },
};
