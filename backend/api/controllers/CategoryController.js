/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests related to categories.
 *                 Dieser Controller kümmert sich um das Routing und verwendet den Service,
 *                 um die Kategorien aus der Datenbank abzurufen.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/actions
 */
const errors = require('../utils/errors');

module.exports = {

  /**
   * `CategoryController.create()`
   *
   * @description
   * Erstellt eine neue Kategorue über den Service und gibt sie als JSON zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Die HTTP-Response, um die Antwort zurückzugeben.
   * @returns {Response} Die erstellte Kategorie oder ein Serverfehler.
   */
  create: async function(req, res) {
    try {
      const { name, type } = req.body;
      const category = await CategoryService.createCategory({ name, type });
      return res.json(category);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * `CategoryController.find()`
   *
   * @description
   * Lädt alle vorhandenen Kategorien über den Service und gibt sie als JSON zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Die HTTP-Response, um die Antwort zurückzugeben.
   * @returns {Response} JSON-Array der Kategorien oder ein Serverfehler.
   */
  find: async function(req, res) {
    try {
      const categories = await CategoryService.findAllCategories();
      return res.json(categories);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  }

};
