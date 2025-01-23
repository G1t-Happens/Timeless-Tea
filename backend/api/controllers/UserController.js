/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests related to Users.
 *                 Dieser Controller kümmert sich um das Routing und verwendet den Service,
 *                 um die Benutzer zu verwalten.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/actions
 */
const errors = require('../utils/errors');

module.exports = {
  /**
   * `UserController.findOne()`
   *
   * @description
   * Lädt einen einzelnen Benutzer anhand der übergebenen Benutzer-ID im `req.params.id`.
   * Gibt den gefundenen Benutzer (HTTP 200 OK) oder einen Fehlerstatus zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Benutzer-ID in den URL-Parametern.
   * @param {Response} res - Die HTTP-Response, um den gefundenen Benutzer zurückzugeben.
   * @returns {Response} Der gefundene Benutzer oder ein Fehlerstatus.
   */
  findOne: async function (req, res) {
    try {
      const user = await UserService.findUserById(req);
      return res.json(user);
    } catch (err) {
      sails.log.error('Error in UserController.findOne:', err);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('Ein unerwarteter Fehler ist aufgetreten.');
    }
  },

  /**
   * `UserController.find()`
   *
   * @description
   * Sucht nach Benutzern anhand optionaler Filter (z.B. Suchstring nach Namen)
   * sowie optionaler Pagination-Parameter (Seite und Größe).
   * Gibt eine Liste von Benutzern sowie ggf. Pagination-Informationen zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit optionalen Query-Parametern für Filter und Pagination.
   * @param {Response} res - Die HTTP-Response, um das Suchergebnis zurückzugeben.
   * @returns {Response} Das Suchergebnis mit Benutzern und optionalen Meta-Informationen.
   */
  find: async function (req, res) {
    try {
      const result = await UserService.findUsers(req);
      return res.json(result);
    } catch (err) {
      sails.log.error('Error in UserController.find:', err);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('Ein unerwarteter Fehler ist aufgetreten.');
    }
  },

  /**
   * `UserController.patch()`
   *
   * @description
   * Aktualisiert einen bestehenden Benutzer anhand der übergebenen Benutzer-ID und/oder weiteren Feldern im Request-Body.
   * Gibt den aktualisierten Benutzer (HTTP 200 OK) zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Benutzer-ID in den URL-Parametern und aktualisierten Daten im Body.
   * @param {Response} res - Die HTTP-Response, um den aktualisierten Benutzer zurückzugeben.
   * @returns {Response} Der aktualisierte Benutzer oder ein Fehlerstatus.
   */
  patch: async function (req, res) {
    try {
      const updatedUser = await UserService.updateUser(req);
      return res.json(updatedUser);
    } catch (err) {
      sails.log.error('Error in UserController.patch:', err);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('Ein unerwarteter Fehler ist aufgetreten.');
    }
  },

  /**
   * `UserController.destroy()`
   *
   * @description
   * Löscht einen Benutzer anhand der übergebenen Benutzer-ID im `req.params.id`.
   * Gibt bei Erfolg HTTP 200 OK zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Benutzer-ID in den URL-Parametern.
   * @param {Response} res - Die HTTP-Response zur Bestätigung der Löschung.
   * @returns {Response} Eine leere Antwort mit Status 200 oder ein Fehlerstatus.
   */
  destroy: async function (req, res) {
    try {
      await UserService.deleteUser(req);
      return res.ok();
    } catch (err) {
      sails.log.error('Error in UserController.destroy:', err);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('Ein unerwarteter Fehler ist aufgetreten.');
    }
  },

  /**
   * `UserController.count()`
   *
   * @description
   * Zaehlt alle bestehenden User.
   * Gibt die Anzahl an User (HTTP 200 OK) zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request(Hier nicht benoetigt)
   * @param {Response} res - Die HTTP-Response, um die Anzahl an User zurückzugeben.
   * @returns {Response} userCount oder ein Fehlerstatus.
   */
  count: async function (req, res) {
    try {
      const userCount = await UserService.countUsers();
      return res.json(userCount);
    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  }

};
