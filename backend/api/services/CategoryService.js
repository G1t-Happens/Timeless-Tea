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
   * @param {object} req - Das Sails.js-Request-Objekt
   * @returns  Die erstellte Kategorie.
   * @throws {BadRequestError} Wenn die Kategorie nicht erstellt werden konnte.
   */
  createCategory: async function (req) {

    const { name, type } = req.body;

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
  },

  /**
   * updateCategories()
   *
   * Updated eine vorhanden Kategory anhand der id.
   *
   * @returns Updated Category.
   */
  updateCategory: async function(req) {
    const id = req.params.id;
    const { name, type } = req.body;

    if (!id) {
      throw new errors.BadRequestError('Category id required.');
    }

    if (!name || !type) {
      throw new errors.BadRequestError('Category name and type are required.');
    }

    // Finde das Payment mit der ID
    const category = await Category.findOne({ id });

    if (!category) {
      throw new errors.NotFoundError('Category not found.');
    }

    return await Category.updateOne({ id }).set({ name, type });
  },

  /**
   * deleteCategory()
   *
   * Loescht eine vorhandene Kategorie anhand der ID.
   *
   */
  deleteCategory: async function (req) {
    const id = req.params.id;

    if (!id) {
      throw new errors.BadRequestError('Category ID is required.');
    }

    // Finde die Kategorie mit der ID
    const category = await Category.findOne({ id });

    if (!category) {
      throw new errors.NotFoundError('Category not found.');
    }

    // Lösche alle Verknüpfungen in der Zwischentabelle
    await ProductCategory.destroy({ category: id });

    // Lösche die Kategorie
    await Category.destroy({ id });
  }

};
