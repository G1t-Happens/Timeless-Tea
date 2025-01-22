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
   * @param {Object} params - Die Parameter zum Erstellen einer neuen Zahlungsmethode.
   * @param {string} params.paymentOption - Die Art der Zahlungsmethode.
   * @param {string} params.iban - Die IBAN, falls Zahlungsmethode = bank transfer.
   * @param {string} params.creditCardNumber - Die Kreditkartennummer, falls Zahlungsmethode = credit card.
   * @param {string} params.expiryDate - Das Ablaufdatum, falls Zahlungsmethode = credit card.
   * @param {boolean} params.cvc - Das CVC, falls Zahlungsmethode = credit card.
   * @param {boolean} params.paypalEmail - Die Email, falls Zahlungsmethode = paypal.
   * @param {boolean} params.user - Der user, fuer den diese Zahlungsmethode gedacht ist.
   *
   * @throws {BadRequestError} Wenn eines der Pflichtfelder fehlt.
   *
   * @returns {Promise<Object>} Die neu erstellte Nachricht als Datensatz.
   */
  createPayment: async function ({ paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail, user }) {

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
   * @param {Object} id - Die id der Users fuer welche wir alle Payments anzeigen lassen wollen.
   *
   * @returns {Promise<Object>} Alle Userspezifischen Payment-Objekt aus der DB.
   */
  findByUserId: async function ({ id }) {

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
   * @param {Object} params - Objekt mit allen Parametern.
   * @param {Object} params.oldPayment - Das vorhandene Payment-Objekt (bereits aus DB geladen).
   * @param {string} params.paymentOption - Neue Zahlungsoption (z.B. bank transfer, credit card, paypal).
   * @param {string} [params.iban] - Neue IBAN, falls Banküberweisung.
   * @param {string} [params.creditCardNumber] - Neue Kreditkartennummer, falls Kreditkarte.
   * @param {string} [params.expiryDate] - Neues Ablaufdatum, falls Kreditkarte.
   * @param {string} [params.cvc] - Neuer CVC, falls Kreditkarte.
   * @param {string} [params.paypalEmail] - Neue PayPal-E-Mail-Adresse, falls PayPal.
   *
   * @returns {Promise<Object>} Das aktualisierte Payment-Objekt aus der DB.
   */
  updatePayment: async function ({ oldPayment, paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail }) {
    // Die ID, die aktualisiert werden soll
    const { id } = oldPayment;

    // Business Logik zur Ausführung des Updates
    const updatedPayment = await Payment.updateOne({ id }).set({
      paymentOption,
      iban: paymentOption === 'bank transfer' ? iban : oldPayment.iban,
      creditCardNumber: paymentOption === 'credit card' ? creditCardNumber : oldPayment.creditCardNumber,
      expiryDate: paymentOption === 'credit card' ? expiryDate : oldPayment.expiryDate,
      cvc: paymentOption === 'credit card' ? cvc : oldPayment.cvc,
      paypalEmail: paymentOption === 'paypal' ? paypalEmail : oldPayment.paypalEmail
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
   * @param {Object} id - Die id des zu loeschenden Payment Objects.
   *
   * @returns {Promise<Object>} Das aktualisierte Payment-Objekt aus der DB.
   */
  deletePayment: async function ({ id }) {

    // Business Logik zur Ausführung des Updates
    const deletedPayment = await Payment.destroy({ id }).fetch();

    if (!deletedPayment) {
      // Falls das Update schiefgegangen oder der Datensatz in der Zwischenzeit gelöscht wurde
      throw new errors.NotFoundError('Payment could not be deleted.');
    }

    return deletedPayment;
  },
};
