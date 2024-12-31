/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests related to categories.
 *                 Dieser Controller kümmert sich um das Routing und verwendet den Service,
 *                 um die Kategorien aus der Datenbank abzurufen.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/actions
 */

const CategoryService = require('../services/CategoryService'); // Pfad anpassen, wenn nötig

module.exports = {

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
      // Service aufrufen, der die Kategorien aus der DB lädt
      const categories = await CategoryService.findAllCategories();
      return res.json(categories);
    } catch (error) {
      // Bei Fehlern: Server-Error zurückgeben
      return res.serverError(error.toString());
    }
  }

};
