const errors = require('../utils/errors');
/**
 * api/services/CategoryService.js
 *
 * @description :: Service zum Verwalten von Kategorien.
 *                 Hier werden Zugriffe auf die Datenbank oder andere Business-Logik gekapselt.
 */
module.exports = {

  /**
   * Erstellt eine neue Kategorie in der Datenbank.
   *
   * @param {string} name - Der Name der Kategorie.
   * @param {string} type - Der Typ der Kategorie.
   * @returns  Die erstellte Kategorie.
   * @throws {BadRequestError} Wenn die Kategorie nicht erstellt werden konnte.
   */
  createCategory: async function ({ name, type }) {

    if (!name || !type) {
      throw new errors.BadRequestError('Category name and type are required.');
    }

    // Kategorie direkt erstellen und zurückliefern
    return await Category.create({ name, type }).fetch();
  },

  /**
   * findAllCategories()
   *
   * Lädt alle vorhandenen Kategorien aus der Datenbank.
   *
   * @returns Categories. Ansonsten undefined.
   */
  findAllCategories: async function() {
    return await Category.find();
  }
};
