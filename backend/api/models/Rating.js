/**
 * Rating.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // Die Anzahl der Sterne, die für die Bewertung vergeben wurden
    stars: { type: 'number', columnType: 'integer', required: true },

    // Die Bewertung gehört zu einem Produkt
    product: {
      model: 'product',  // Verweist auf das Product Model
      //required: true     // Eine Bewertung muss immer zu einem Produkt gehören
    }

  },

};
