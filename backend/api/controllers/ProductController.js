/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
  create: async function(req, res) {
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
            category: categoryId
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

  findOne: async function(req, res) {
    try {
      const productId = req.param('id');
      if (!productId) {
        return res.badRequest({ error: 'Product ID is required.' });
      }

      // Effizienten Datenabfrage
      const query = `
        SELECT p.id,
               p.name,
               p.description,
               p.price,
               p.image,
               p.reviews,
               COALESCE(AVG(r.stars), 0) AS "averageRating",
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'id', c.id,
                   'name', c.name,
                   'type', c.type
                 )
               )                         AS "productCategories"
        FROM product p
               LEFT JOIN productrating pr ON p.id = pr.product
               LEFT JOIN rating r ON pr.rating = r.id
               LEFT JOIN productcategory pc ON p.id = pc.product
               LEFT JOIN category c ON pc.category = c.id
        WHERE p.id = $1
        GROUP BY p.id
      `;

      const result = await sails.sendNativeQuery(query, [productId]);

      const product = result.rows[0];
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      // Parse das JSON-Array der Produkt-Kategorien und falls nicht vorhanden, setze leeren Array
      const parsedCategories = product.productCategories ? JSON.parse(product.productCategories) : [];
      product.productCategories = parsedCategories.some(category => category.id !== null) ? parsedCategories : [];
      return res.json(product);
    } catch (error) {
      sails.log.error('Error in findOne:', error.message);
      return res.serverError('Failed to retrieve product details.');
    }
  },

  find: async function(req, res) {
    try {
      const search = req.query.search ? `%${req.query.search}%` : null;
      const page = req.query.page ? parseInt(req.query.page, 10) : null;
      const size = req.query.size ? parseInt(req.query.size, 10) : null;
      const categories = req.query.categories
        ? req.query.categories.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : null;
      const price = req.query.price ? parseFloat(req.query.price) : null;
      const rating = req.query.rating ? parseFloat(req.query.rating) : null;

      // Basis-Query-Teile
      let baseQuery = `
        SELECT p.*,
               JSON_ARRAYAGG(JSON_OBJECT(
                 'id', c.id,
                 'name', c.name,
                 'type', c.type
                             ))          AS productCategories,
               COALESCE(AVG(r.stars), 0) AS averageRating
        FROM product p
               LEFT JOIN productcategory pc ON p.id = pc.product
               LEFT JOIN category c ON pc.category = c.id
               LEFT JOIN productrating pr ON p.id = pr.product
               LEFT JOIN rating r ON pr.rating = r.id
      `;

      // Bedingungen für WHERE-Klausel
      let whereClauses = [];
      let havingClauses = [];
      let queryParams = [];
      let paramIndex = 1;

      if (search) {
        whereClauses.push(`p.name LIKE $${paramIndex}`);
        queryParams.push(search);
        paramIndex++;
      }

      if (categories && categories.length > 0) {
        // Generiere Platzhalter für jede Kategorie
        const categoryPlaceholders = categories.map(() => `$${paramIndex++}`).join(',');
        whereClauses.push(`c.id IN (${categoryPlaceholders})`);
        queryParams.push(...categories);
      }

      if (price !== null && !isNaN(price)) {
        whereClauses.push(`p.price <= $${paramIndex}`);
        queryParams.push(price);
        paramIndex++;
      }

      // Kombinierte WHERE-Klausel
      if (whereClauses.length > 0) {
        baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      // Gruppierung
      baseQuery += `
        GROUP BY p.id
      `;

      if (rating !== null && !isNaN(rating)) {
        havingClauses.push(`averageRating >= $${paramIndex}`);
        queryParams.push(rating);
        paramIndex++;
      }

      // Kombinierte HAVING-Klausel
      if (havingClauses.length > 0) {
        baseQuery += ` HAVING ${havingClauses.join(' AND ')}`;
      }

      // Gesamte Anzahl für Pagination berechnen
      let totalCount = 0;
      if (page && size) {
        let countQuery = `
          SELECT COUNT(DISTINCT p.id) AS total
          FROM product p
                 LEFT JOIN productcategory pc ON p.id = pc.product
                 LEFT JOIN category c ON pc.category = c.id
                 LEFT JOIN productrating pr ON p.id = pr.product
                 LEFT JOIN rating r ON pr.rating = r.id
        `;

        // WHERE-Klauseln für countQuery
        let countWhereClauses = [];
        let countHavingClauses = [];
        let countParams = [];
        let countParamIndex = 1;

        if (search) {
          countWhereClauses.push(`p.name LIKE $${countParamIndex}`);
          countParams.push(search);
          countParamIndex++;
        }

        if (categories && categories.length > 0) {
          const categoryPlaceholders = categories.map(() => `$${countParamIndex++}`).join(',');
          countWhereClauses.push(`c.id IN (${categoryPlaceholders})`);
          countParams.push(...categories);
        }

        if (price !== null && !isNaN(price)) {
          countWhereClauses.push(`p.price <= $${countParamIndex}`);
          countParams.push(price);
          countParamIndex++;
        }

        if (countWhereClauses.length > 0) {
          countQuery += ` WHERE ${countWhereClauses.join(' AND ')}`;
        }

        // Gruppierung für countQuery
        countQuery += ` GROUP BY p.id`;

        if (rating !== null && !isNaN(rating)) {
          countHavingClauses.push(`AVG(r.stars) >= $${countParamIndex}`);
          countParams.push(rating);
          countParamIndex++;
        }

        if (countHavingClauses.length > 0) {
          countQuery += ` HAVING ${countHavingClauses.join(' AND ')}`;
        }

        // Da wir GROUP BY verwenden, müssen wir die Gesamtanzahl über eine Unterabfrage berechnen
        const finalCountQuery = `
          SELECT COUNT(*) AS total
          FROM (
                 ${countQuery}
                 ) AS subquery
        `;

        const countResult = await sails.sendNativeQuery(finalCountQuery, countParams);
        totalCount = parseInt(countResult.rows[0].total, 10) || 0;
      }

      // Pagination anwenden, falls erforderlich
      if (page && size) {
        baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(size, (page - 1) * size);
      }

      // Finalen Query ausführen
      const products = await sails.sendNativeQuery(baseQuery, queryParams);

      // Ergebnisse verarbeiten
      const results = products.rows.map(product => ({
        ...product,
        productCategories: JSON.parse(product.productCategories || '[]')
      }));

      // Response zusammenstellen
      if (page && size) {
        const totalPages = Math.ceil(totalCount / size);
        return res.json({
          products: results,
          total: totalCount,
          totalPages: totalPages,
          currentPage: page,
          hasMore: page < totalPages
        });
      } else {
        return res.json({
          products: results,
          total: results.length // Gesamtanzahl der gefundenen Produkte
        });
      }
    } catch (error) {
      sails.log.error('Error in find:', error.message);
      return res.serverError('Failed to retrieve products.');
    }
  },

  destroy: async function(req, res) {
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

  patch: async function(req, res) {
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
            category: categoryId
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
  }
};


