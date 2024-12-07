/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async function(req, res) {
    try {
      let product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
      }).fetch();

      if (req.body.categories) {
        await Promise.all(
          req.body.categories.map(async (categoryId) => {
            await ProductCategory.create({
              product: product.id,
              category: categoryId
            });
          })
        );
      }

      return res.status(201).json(product);
    } catch (err) {
      return res.serverError(err.toString());
    }
  },
  findOne: async function (req, res) {
    sails.log.debug('List single Product....');
    let product = await Product.findOne({ id: req.params.id }).populate('productCategories');
    res.json(product);
  },
  find: async function (req, res) {
    sails.log.debug('List all Products with average ratings...');
    const search = req.query.search;

    try {
      let queryOptions = {};
      if (search) {
        queryOptions.where = { name: { contains: search } };
      }

      // Lade alle Produkte und deren Kategorien
      let products = await Product.find(queryOptions).populate('productCategories');
      if (!products || products.length === 0) {
        return res.status(404).json({ error: 'Keine Produkte gefunden' });
      }

      // Angepasste SQL-Abfrage ueber Zwischentabelle, um Durchschnittsbewertungen für Produkte zu berechnen
      let averageRatingSQL = `
      SELECT pr.product, AVG(r.stars) AS averageRating
      FROM productrating pr
      JOIN rating r ON pr.rating = r.id
      GROUP BY pr.product
      `;

      // Führe den Native Query aus auf der Datenbank aus
      let rawResult = await sails.sendNativeQuery(averageRatingSQL);

      // Mappe die Durchschnittswerte auf die Produkte
      let averageRatings = rawResult.rows.reduce((acc, row) => {
        acc[row.product] = parseFloat(row.averageRating) || 0; // Durchschnittswerte nach Produkt-ID speichern
        return acc;
      }, {});

      // Durchschnittsrating jedem Produkt hinzufügen
      products = products.map(product => {
        product.averageRating = averageRatings[product.id] || 0; // Standardwert 0, falls kein Rating vorhanden ist
        return product;
      });

      return res.json(products);
    } catch (error) {
      sails.log.error('Error while fetching products:', error);
      return res.serverError('Ein Fehler ist aufgetreten.');
    }
  },
  destroy: async function (req, res) {
    sails.log.debug('Delete Product....');
    const productId = req.params.id;

    try {
      // Lösche alle verknüpften ProductCategory-Einträge
      await ProductCategory.destroy({ product: productId });

      // Danach lösche das Produkt
      await Product.destroy({ id: productId });

      return res.ok();
    } catch (error) {
      sails.log.error('Error deleting product:', error);
      return res.serverError('Failed to delete product.');
    }
  },
  patch: async function (req, res) {
    sails.log.debug('Updating Product....');
    const productId = req.params.id;

    try {
      // Daten aus dem Anfrage-Body extrahieren
      const { name, description, price, productCategories } = req.body;

      // Überprüfen, ob das Produkt existiert
      const existingProduct = await Product.findOne({ id: productId });
      if (!existingProduct) {
        return res.notFound({ error: `Product with id ${productId} not found.` });
      }

      // Produkt aktualisieren
      await Product.updateOne({ id: productId }).set({
        name,
        description,
        price
      });

      // Manage categories
      if (productCategories) {
        // Remove existing categories
        await ProductCategory.destroy({ product: productId });

        // Add new categories
        for (const categoryId of productCategories) {
          await ProductCategory.create({ product: productId, category: categoryId });
        }
      }

      // Respond with updated product information
      const fullUpdatedProduct = await Product.findOne({ id: productId }).populate('productCategories');
      return res.json(fullUpdatedProduct);
    } catch (error) {
      sails.log.error('Error updating product:', error);
      return res.serverError({ error: 'An error occurred while updating the product.' });
    }
  }

};

