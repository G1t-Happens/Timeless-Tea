/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests related to categories.
 *                 Dieser Controller kümmert sich um das Abrufen von Kategorien aus der Datenbank.
 *
 * @help        :: Siehe Sails.js-Dokumentation unter https://sailsjs.com/docs/concepts/actions
 */
module.exports = {

  /**
   * `CategoryController.find()`
   *
   * @description
   * Lädt alle vorhandenen Kategorien aus der Datenbank per vordefinierter find() und gibt sie als JSON-Array zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   * @param {Response} res - Die HTTP-Response, um die Antwort zurückzugeben.
   * @returns {Response} JSON-Array der Kategorien oder ein Serverfehler.
   */
  find: async function(req, res) {
    try {
      // Alle Kategorien aus der Datenbank abrufen
      const categories = await Category.find();
      return res.json(categories);
    } catch (err) {
      // Tritt ein Fehler auf, wird ein Serverfehler zurückgegeben
      return res.serverError(err.toString());
    }
  }
};
