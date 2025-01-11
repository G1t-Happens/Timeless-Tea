/**
 * ProductCategory
 *
 * @description :: Eine Zwischentabelle (Join Table), um die Many-to-Many-Beziehung
 *                 zwischen Produkten und Kategorien abzubilden und aufzuloesen.
 */

module.exports = {
  attributes: {
    /**
     * @description Verknüpft dieses Eintragsobjekt mit einem bestimmten Produkt.
     * @required Ja, jede Verknüpfung muss auf ein Produkt verweisen.
     */
    product: {
      model: 'product',
      required: true,
    },

    /**
     * @description Verknüpft dieses Eintragsobjekt mit einer bestimmten Kategorie.
     * @required Ja, jede Verknüpfung muss auf eine Kategorie verweisen.
     */
    category: {
      model: 'category',
      required: true,
    }
  }
};
