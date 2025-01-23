/**
 * api/services/ContactMessageService.js
 *
 * @description :: Service zum Verwalten von Kontaktformular-Nachrichten.
 *                 Hier werden Zugriffe auf die Datenbank oder andere Business-Logik gekapselt,
 *                 die für das Erstellen, Auslesen oder Löschen von Nachrichten benötigt wird.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/services
 */

const errors = require('../utils/errors');
module.exports = {

  /**
   * `ContactMessageService.createMessage()`
   *
   * @description
   * Erstellt eine neue Kontakt-Nachricht in der Datenbank.
   *
   * @param {object} req - Das Sails.js-Request-Objekt
   *
   * @throws {BadRequestError} Wenn eines der Pflichtfelder fehlt.
   *
   * @returns {Promise<Object>} Die neu erstellte Nachricht als Datensatz.
   */
  createMessage: async function (req) {
    // Extrahiere Messagedaten aus dem Request Body
    const { name, email, subject, message, privacy } = req.body;

    //Inputvalidation
    if (!name) {
      throw new errors.BadRequestError('Name is required.');
    }

    if (!email) {
      throw new errors.BadRequestError('Email is required.');
    }

    if (!subject) {
      throw new errors.BadRequestError('Subject is required.');
    }

    if (!message) {
      throw new errors.BadRequestError('Message is required.');
    }

    if (!privacy) {
      throw new errors.BadRequestError('Privacy agreement is required.');
    }

    //Erstellen einer neuen Nachricht
    return await ContactMessage.create({
      name,
      email,
      subject,
      message,
      privacy,
    }).fetch();
  },

  /**
   * `ContactMessageService.findMessage()`
   *
   * @description
   * Lädt alle in der Datenbank vorhandenen Kontakt-Nachrichten.
   *
   * @returns {Promise<Array>} Eine Liste aller gefundenen Nachrichten.
   */
  findMessage: async function () {
    //Suche nach allen Nachrichten in der DB
    return await ContactMessage.find();
  },

  /**
   * `ContactMessageService.findOneMessage()`
   *
   * @description
   * Lädt eine einzelne Kontakt-Nachricht anhand ihrer ID.
   *
   * @param {object} req - Das Sails.js-Request-Objekt
   *
   * @throws {NotFoundError} Wenn keine Nachricht mit der übergebenen ID gefunden wird.
   *
   * @returns {Promise<Object>} Die gefundene Nachricht.
   */
  findOneMessage: async function (req) {
    // Extrahiere die Messge id aus dem Request
    const { id } = req.params;
    // Message anhand der id suchen
    const message = await ContactMessage.findOne({ id });
    // Falls keine gefunden -> 404
    if(!message) {
      throw new errors.NotFoundError('Message not found.');
    }
    return message;
  },

  /**
   * `ContactMessageService.destroyOneMessage()`
   *
   * @description
   * Löscht eine Kontakt-Nachricht anhand ihrer ID aus der Datenbank.
   *
   * @param {object} req - Das Sails.js-Request-Objekt
   *
   * @throws {NotFoundError} Wenn keine Nachricht mit der übergebenen ID gefunden wird.
   *
   * @returns {Promise<void>} Kein Rückgabewert bei erfolgreicher Löschung.
   */
  destroyOneMessage: async function (req) {
    // Extrahiere die Messge id aus dem Request
    const { id } = req.params;
    // Message anhand der id loeschen
    const message = await ContactMessage.destroyOne({ id });
    // Falls keine gefunden -> 404
    if(!message) {
      throw new errors.NotFoundError('Message not found.');
    }
  },

};
