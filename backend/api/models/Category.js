/**
 * Category.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: { type: 'string', columnType: 'varchar(80)', required: true },

    // Verknüpfung zu den Produkten, die zu dieser Kategorie gehören
    products: {
      collection: 'product',  // Das ist die Verknüpfung zur "Product"-Entität
      via: 'categories'      // Der Fremdschlüssel in der "Product"-Entität
    }

  }

};

