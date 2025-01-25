/**
 * Category
 *
 * @description :: Das Datenmodell für unsere Kategorien
 *                 Kategorien können verschiedene Typen haben und sind über eine Many-to-Many-Beziehung
 *                 mit Produkten verknüpft (über die ProductCategory-Tabelle).
 */

module.exports = {
  attributes: {
    /**
     * @description Der Name der Kategorie.
     * @type {string}
     * @required Ja, jede Kategorie benötigt einen Namen.
     */
    name: {
      type: 'string',
      maxLength: 20,
      required: true
    },

    /**
     * @description Der Typ der Kategorie, z. B. "Taste", "Effect".
     * @type {string}
     * @required Ja, jede Kategorie benötigt einen Typ.
     */
    type: {
      type: 'string',
      maxLength: 20,
      required: true
    },

    /**
     * @description Beziehung zu ProductCategory, um viele Produkte mit vielen Kategorien zu verknüpfen.
     */
    productCategories: {
      collection: 'productcategory',
      via: 'category'
    }
  }
};
