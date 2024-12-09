const errors = require('../utils/errors');

/**
 * ProductService
 *
 * @description :: Server-side functions for handling business logic
 */
module.exports = {
  /**
   * Erstelle ein Produkt
   */
  createProduct: async function (req) {
    const { name, description, price, categories } = req.body;

    if (!name || !price) {
      throw new errors.BadRequestError('Product name and price are required.');
    }

    return await sails.getDatastore().transaction(async (db) => {
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
  },

  /**
   * Ruft ein Produkt anhand seiner ID ab
   */
  findProductById: async function (req) {
    const productId = req.params.id;
    if (!productId) {
      throw new errors.BadRequestError('Product ID is required.');
    }

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
             ) AS "productCategories"
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
      throw new errors.NotFoundError('Product not found.');
    }

    const parsedCategories = product.productCategories ? JSON.parse(product.productCategories) : [];
    product.productCategories = parsedCategories.some(category => category.id !== null) ? parsedCategories : [];

    return product;
  },

  /**
   * Suche nach Produkten mit Filtern
   */
  findProducts: async function (req) {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const size = req.query.size ? parseInt(req.query.size, 10) : null;
    const categories = req.query.categories
      ? req.query.categories.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      : null;
    const price = req.query.price ? parseFloat(req.query.price) : null;
    const rating = req.query.rating ? parseFloat(req.query.rating) : null;

    let baseQuery = `
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
    `;

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
      const categoryPlaceholders = categories.map(() => `$${paramIndex++}`).join(',');
      whereClauses.push(`c.id IN (${categoryPlaceholders})`);
      queryParams.push(...categories);
    }

    if (price !== null && !isNaN(price)) {
      whereClauses.push(`p.price <= $${paramIndex}`);
      queryParams.push(price);
      paramIndex++;
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    baseQuery += `
      GROUP BY p.id
    `;

    if (rating !== null && !isNaN(rating)) {
      havingClauses.push(`averageRating >= $${paramIndex}`);
      queryParams.push(rating);
      paramIndex++;
    }

    if (havingClauses.length > 0) {
      baseQuery += ` HAVING ${havingClauses.join(' AND ')}`;
    }

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

      countQuery += ` GROUP BY p.id`;

      if (rating !== null && !isNaN(rating)) {
        countHavingClauses.push(`AVG(r.stars) >= $${countParamIndex}`);
        countParams.push(rating);
        countParamIndex++;
      }

      if (countHavingClauses.length > 0) {
        countQuery += ` HAVING ${countHavingClauses.join(' AND ')}`;
      }

      const finalCountQuery = `
        SELECT COUNT(*) AS total
        FROM (
               ${countQuery}
             ) AS subquery
      `;
      const countResult = await sails.sendNativeQuery(finalCountQuery, countParams);
      totalCount = parseInt(countResult.rows[0].total, 10) || 0;
    }

    if (page && size) {
      baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(size, (page - 1) * size);
    }

    const products = await sails.sendNativeQuery(baseQuery, queryParams);

    const results = products.rows.map(product => ({
      ...product,
      productCategories: JSON.parse(product.productCategories || '[]')
    }));

    if (page && size) {
      const totalPages = Math.ceil(totalCount / size);
      return {
        products: results,
        total: totalCount,
        totalPages: totalPages,
        currentPage: page,
        hasMore: page < totalPages
      };
    } else {
      return {
        products: results,
        total: results.length
      };
    }
  },

  /**
   * Löscht ein Produkt
   */
  deleteProduct: async function (req) {
    const productId = req.params.id;
    if (!productId) {
      throw new errors.BadRequestError('Product ID is required.');
    }
    await ProductCategory.destroy({ product: productId });
    await ProductRating.destroy({ product: productId });
    await Product.destroy({ id: productId });
  },

  /**
   * Aktualisiert ein Produkt
   */
  updateProduct: async function (req) {
    const productId = req.params.id;

    if (!productId) {
      throw new errors.BadRequestError('Product ID is required.');
    }

    const { name, description, price, productCategories } = req.body;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      throw new errors.NotFoundError(`Product with id ${productId} not found.`);
    }
    return await sails.getDatastore().transaction(async (db) => {
      await Product.updateOne({ id: productId })
          .set({ name, description, price })
          .usingConnection(db);

      if (productCategories) {
        await ProductCategory.destroy({ product: productId }).usingConnection(db);
        const newCategories = productCategories.map((categoryId) => ({
          product: productId,
          category: categoryId
        }));
        await ProductCategory.createEach(newCategories).usingConnection(db);
      }
      return await Product.findOne({ id: productId }).populate('productCategories').usingConnection(db);
    });
  }
};
