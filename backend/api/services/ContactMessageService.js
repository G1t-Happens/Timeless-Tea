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
   * @param {Object} params - Die Parameter zum Erstellen einer neuen Nachricht.
   * @param {string} params.name - Der Name der Person, die die Nachricht sendet.
   * @param {string} params.email - Die Email-Adresse der Person.
   * @param {string} params.subject - Der Betreff der Nachricht.
   * @param {string} params.message - Der eigentliche Nachrichteninhalt.
   * @param {boolean} params.privacy - Einverständnis für den Datenschutz.
   *
   * @throws {BadRequestError} Wenn eines der Pflichtfelder fehlt.
   *
   * @returns {Promise<Object>} Die neu erstellte Nachricht als Datensatz.
   */
  createMessage: async function ({ name, email, subject, message, privacy }) {

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
    return await ContactMessage.find();
  },

  /**
   * `ContactMessageService.findOneMessage()`
   *
   * @description
   * Lädt eine einzelne Kontakt-Nachricht anhand ihrer ID.
   *
   * @param {Object} params - Das Parameter-Objekt.
   * @param {string} params.id - Die eindeutige ID der Nachricht.
   *
   * @throws {NotFoundError} Wenn keine Nachricht mit der übergebenen ID gefunden wird.
   *
   * @returns {Promise<Object>} Die gefundene Nachricht.
   */
  findOneMessage: async function ({ id }) {
    const message = await ContactMessage.findOne({ id });
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
   * @param {Object} params - Das Parameter-Objekt.
   * @param {string} params.id - Die eindeutige ID der Nachricht.
   *
   * @throws {NotFoundError} Wenn keine Nachricht mit der übergebenen ID gefunden wird.
   *
   * @returns {Promise<void>} Kein Rückgabewert bei erfolgreicher Löschung.
   */
  destroyOneMessage: async function ({ id }) {
    const message = await ContactMessage.destroyOne({ id });
    if(!message) {
      throw new errors.NotFoundError('Message not found.');
    }
  },

};
