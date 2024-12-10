/**
 * Rating
 *
 * @description :: Unser Datenmodell für Bewertungen von Produkten.
 *                 Jede Bewertung hat eine Zahl(1-5) und kann mit vielen Produkten verknüpft sein.
 */
module.exports = {
  attributes: {
    /**
     * @description Anzahl der Sterne für diese Bewertung.
     * @type {number}
     * @required Ja, jede Bewertung muss eine Sternanzahl haben.
     */
    stars: {
      type: 'number',
      columnType: 'integer',
      required: true,
      min: 1,
      max: 5
    },

    /**
     * @description Beziehung zu ProductRating, um die Verbindung zu Produkten herzustellen.
     */
    productRatings: {
      collection: 'productrating',
      via: 'rating',
    }
  }
};
