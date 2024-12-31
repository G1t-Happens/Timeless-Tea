/**
 * api/services/CategoryService.js
 *
 * @description :: Service zum Verwalten von Kategorien.
 *                 Hier werden Zugriffe auf die Datenbank oder andere Business-Logik gekapselt.
 */
module.exports = {
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
