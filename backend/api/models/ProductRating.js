/**
 * ProductRating
 *
 * @description :: Eine Zwischentabelle (Join Table), um die Many-to-Many-Beziehung
 *                 zwischen Produkten und Ratings abzubilden und aufzuloesen.
 */
module.exports = {
  attributes: {
    /**
     * @description Verknüpft dieses Eintragsobjekt mit einem bestimmten Produkt.
     * @required Ja, jede Verknüpfung muss auf ein Produkt verweisen.
     */
    product: {
      model: 'product',
      required: true
    },

    /**
     * @description Verknüpft dieses Eintragsobjekt mit einer bestimmten Bewertung (Rating).
     * @required Ja, jede Verknüpfung muss auf ein Rating verweisen.
     */
    rating: {
      model: 'rating',
      required: true
    }
  }
};
