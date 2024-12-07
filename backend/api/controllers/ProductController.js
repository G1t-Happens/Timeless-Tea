/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
  create: async function (req, res) {
    try {
      const { name, description, price, categories } = req.body;

      // Erstelle Produkt und setze Kategorien in einer Transaktion fuer bessere performance
      const product = await sails.getDatastore().transaction(async (db) => {
        const newProduct = await Product.create({ name, description, price })
          .fetch()
          .usingConnection(db);

        if (categories && categories.length > 0) {
          const productCategories = categories.map((categoryId) => ({
            product: newProduct.id,
            category: categoryId,
          }));
          await ProductCategory.createEach(productCategories).usingConnection(db);
        }
        return newProduct;
      });
      return res.status(201).json(product);
    } catch (err) {
      sails.log.error('Error creating product:', err.message);
      return res.serverError('Failed to create product. Please try again later.');
    }
  },

  findOne: async function (req, res) {
    try {
      const productId = req.param('id');
      if (!productId) {
        return res.badRequest({ error: 'Product ID is required.' });
      }

      // Effizienten Datenabfrage
      const product = await sails.sendNativeQuery(`
        SELECT p.*,
               JSON_ARRAYAGG(JSON_OBJECT(
                 'id', c.id,
                 'name', c.name,
                 'type', c.type
               )) AS productCategories,
               COALESCE(AVG(r.stars), 0) AS averageRating
        FROM product p
        LEFT JOIN productcategory pc ON p.id = pc.product
        LEFT JOIN category c ON pc.category = c.id
        LEFT JOIN productrating pr ON p.id = pr.product
        LEFT JOIN rating r ON pr.rating = r.id
        WHERE p.id = $1
        GROUP BY p.id
      `, [productId]);

      const result = product.rows[0];
      if (!result) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      result.productCategories = JSON.parse(result.productCategories || '[]');

      return res.json(result);
    } catch (error) {
      sails.log.error('Error in findOne:', error.message);
      return res.serverError('Failed to retrieve product details.');
    }
  },

  find: async function (req, res) {
    try {
      const search = req.query.search || '';
      const page = parseInt(req.query.page, 10) || 1; // Standardseite 1
      const size = parseInt(req.query.size, 10) || 20; // Standardgröße 20
      const offset = (page - 1) * size; // Offset berechnen

      // Effiziente Datenabfrage mit LIMIT und OFFSET für Pagination
      const products = await sails.sendNativeQuery(`
      SELECT p.*,
             JSON_ARRAYAGG(JSON_OBJECT(
               'id', c.id,
               'name', c.name,
               'type', c.type
             )) AS productCategories,
             COALESCE(AVG(r.stars), 0) AS averageRating
      FROM product p
      LEFT JOIN productcategory pc ON p.id = pc.product
      LEFT JOIN category c ON pc.category = c.id
      LEFT JOIN productrating pr ON p.id = pr.product
      LEFT JOIN rating r ON pr.rating = r.id
      WHERE p.name LIKE $1
      GROUP BY p.id
      LIMIT $2 OFFSET $3
    `, [`%${search}%`, size, offset]);

      const totalCountQuery = await sails.sendNativeQuery(`
      SELECT COUNT(*) AS total FROM product
      WHERE name LIKE $1
    `, [`%${search}%`]);

      const totalCount = totalCountQuery.rows[0].total || 0; // Gesamtanzahl der Produkte
      const totalPages = Math.ceil(totalCount / size); // Berechnung der Gesamtseitenanzahl

      const results = products.rows.map((product) => ({
        ...product,
        productCategories: JSON.parse(product.productCategories || '[]'),
      }));

      return res.json({
        products: results,
        total: totalCount,
        totalPages: totalPages,
        currentPage: page,
        hasMore: page < totalPages,
      });
    } catch (error) {
      sails.log.error('Error in find:', error.message);
      return res.serverError('Failed to retrieve products.');
    }
  },

  destroy: async function (req, res) {
    const productId = req.params.id;
    try {
      // Lösche JoinTables + Product - ggf. ON DELETE CASCADE?
      await ProductCategory.destroy({ product: productId });
      await ProductRating.destroy({ product: productId });
      await Product.destroy({ id: productId });
      return res.ok();
    } catch (error) {
      sails.log.error('Error deleting product:', error.message);
      return res.serverError('Failed to delete product.');
    }
  },

  patch: async function (req, res) {
    try {
      const productId = req.params.id;
      const { name, description, price, productCategories } = req.body;

      // Überprüfe, ob das Produkt existiert
      const product = await Product.findOne({ id: productId });
      if (!product) {
        return res.status(404).json({ error: `Product with id ${productId} not found.` });
      }

      // Aktualisiere Produkt und Kategorien in einer Transaktion fuer bessere performance
      const updatedProduct = await sails.getDatastore().transaction(async (db) => {
        // Produkt aktualisieren
        await Product.updateOne({ id: productId })
          .set({ name, description, price })
          .usingConnection(db);

        // Kategorien aktualisieren falls ausgewaehlt
        if (productCategories) {
          await ProductCategory.destroy({ product: productId }).usingConnection(db);
          const newCategories = productCategories.map((categoryId) => ({
            product: productId,
            category: categoryId,
          }));
          await ProductCategory.createEach(newCategories).usingConnection(db);
        }

        // Rückgabe des aktualisierten Produkts
        return await Product.findOne({ id: productId }).populate('productCategories').usingConnection(db);
      });

      return res.json(updatedProduct);
    } catch (error) {
      sails.log.error('Error updating product:', error.message);
      return res.serverError('Failed to update product.');
    }
  },
};


