/**
 * Product.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // Name des Produkts
    name: { type: 'string', columnType: 'varchar(80)', required: true },

    // Beschreibung des Produkts
    description: { type: 'string', columnType: 'varchar(80)' },

    // Preis des Produkts (z.B. als Dezimalzahl)
    price: { type: 'number', columnType: 'decimal(10,2)', required: true },

    // URL-Referenz (z.B. für ein externes Produkt)
    urlReference: { type: 'string', columnType: 'varchar(255)' },

    // Menge des Produkts (z.B. in Gramm oder Litern)
    quantity: { type: 'number', columnType: 'integer', required: true },

    // Bewertungen zum Produkt
    ratings: {
      collection: 'rating',
      via: 'owner'
    },

    // Kategorien zum Produkt
    categories: {
      collection: 'category',  // Verknüpft mit dem Category Model
      via: 'products'         // Der Fremdschlüssel in der Category-Entität
    }

  }

}


