/**
 * ContactMessageController
 *
 * @description :: Server-side actions for handling incoming requests related to contact messages.
 *                 Dieser Controller kümmert sich um das Routing und verwendet den Service,
 *                 um die Kontakt-Nachrichten aus der Datenbank zu verwalten.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/actions
 */
const errors = require('../utils/errors');

module.exports = {

  /**
   * `ContactMessageController.create()`
   *
   * @description
   * Erstellt eine neue Kontakt-Nachricht über den Service und gibt sie als JSON zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Die HTTP-Response, um die Antwort zurückzugeben.
   * @returns {Response} Die erstellte Kontakt-Nachricht oder ein Serverfehler.
   */
  create: async function (req, res) {
    try {
      // Service aufrufen und Message erstellen
      const newMessage = await ContactMessageService.createMessage(req);
      return res.status(201).json({ data: newMessage });

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * `ContactMessageController.find()`
   *
   * @description
   * Lädt alle vorhandenen Kontakt-Nachrichten über den Service und gibt sie als JSON zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Die HTTP-Response, um die Antwort zurückzugeben.
   * @returns {Response} JSON-Array der Kontakt-Nachrichten oder ein Serverfehler.
   */
  find: async function (req, res) {
    try {
      // Service aufrufen und alle Nachrichten finden
      const messages = await ContactMessageService.findMessage();
      return res.status(200).json({ data: messages });

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * `ContactMessageController.findOne()`
   *
   * @description
   * Lädt eine vorhandene Kontakt-Nachricht anhand der ID über den Service und gibt sie als JSON zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request (enthält die ID in den Parametern).
   * @param {Response} res - Die HTTP-Response, um die Antwort zurückzugeben.
   * @returns {Response} Die gefundene Kontakt-Nachricht oder ein Serverfehler.
   */
  findOne: async function (req, res) {
    try {
      // Service aufrufen und eine Nachrichten anhand der id finden
      const message = await ContactMessageService.findOneMessage(req);
      return res.status(200).json({ data: message });

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * `ContactMessageController.destroy()`
   *
   * @description
   * Löscht eine vorhandene Kontakt-Nachricht anhand der ID über den Service.
   *
   * @param {Request} req - Der eingehende HTTP-Request (enthält die ID in den Parametern).
   * @param {Response} res - Die HTTP-Response, um die Antwort zurückzugeben.
   * @returns {Response} Status 200, falls erfolgreich gelöscht, oder ein Serverfehler.
   */
  destroy: async function (req, res) {
    try {
      // Service aufrufen und eine Nachrichten anhand der id loeschen
      await ContactMessageService.destroyOneMessage(req);
      return res.ok();

    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  }
};
