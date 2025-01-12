/**
 * Product
 *
 * @description :: Unser Datenmodell für Produkte.
 *                 Produkte können einer oder mehreren Kategorien und Ratings angehören (Many-to-Many).
 */

module.exports = {
  attributes: {
    /**
     * @description Der Produktname.
     * @type {string}
     * @required Ja, jedes Produkt benötigt einen Namen.
     */
    name: {
      type: 'string',
      columnType: 'varchar(80)',
      required: true
    },

    /**
     * @description Eine kurze Beschreibung des Produkts (Optional)
     * @type {string}
     */
    description: {
      type: 'string',
      columnType: 'varchar(1024)'
    },

    /**
     * @description Der Preis des Produkts.
     * @type {number}
     * @required Ja, jedes Produkt benötigt einen Preis.
     */
    price: {
      type: 'number',
      columnType: 'decimal(10,2)',
      required: true
    },

    /**
     * @description Eine optionale Bild-URL oder Bildname.
     * @type {string}
     */
    image: {
      type: 'string',
      columnType: 'varchar(255)'
    },

    /**
     * @description Die Menge in dem das Produkt in einem Stueck angeboten wird.
     * @type {number}
     * @example idr. 100g
     */
    quantity: {
      type: 'number',
      columnType: 'decimal(10,2)',
      required: false
    },

    /**
     * @description Soft Delete Flag, da wir Produkte die schonmal angeboten und in Bestellungen
     * gelanden sind, niemals loeschen sollte wegen Nachvollziehbarkeit/Referenzen
     */
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Gibt an, ob das Produkt gelöscht wurde.',
    },

    /**
     * @description Beziehung zu ProductRating, um Produktbewertungen abzubilden (Many-to-Many über Rating).
     * Ein Produkt kann mehrere Ratings besitzen.
     * Eine Rating z.B. 5 Stars kann jeweils zu mehreren Produkten zugeordnet werden.
     */
    productRatings: {
      collection: 'productrating',
      via: 'product'
    },

    /**
     * @description Beziehung zu ProductCategory, um Kategorien zu verknüpfen (Many-to-Many).
     * Ein Produkt kann mehrere Kategorien besitzen z.b. Beruhigend und Fruchtig
     * Eine Kategorie z.B. "Beruhigend" kann zu mehreren Produkten zugeordnet werden.
     */
    productCategories: {
      collection: 'productcategory',
      via: 'product'
    },

    /**
     * @description Beziehung zu OrderCategory, um Orders zu verknüpfen (Many-to-Many).
     * Ein Produkt kann mehrere in mehreren Orders vorkommen
     */
    orderProducts: {
      collection: 'orderproduct',
      via: 'product'
    }

  }
};
