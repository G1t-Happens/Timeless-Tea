const errors = require('../utils/errors');

/**
 * ProductService
 *
 * @description :: Server-side functions for handling product-related business logic.
 */
module.exports = {

  /**
   * Erstelle ein Produkt
   *
   * @description
   * Erstellt ein neues Produkt in der Datenbank und verknüpft es optional mit übergebenen Kategorien.
   * Die Erstellung erfolgt in einer Datenbanktransaktion, sodass im Fehlerfall kein halbfertiger Zustand zurückbleibt.
   *
   * @param {Request} req - Der eingehende HTTP-Request von Sails, enthält im Body u.a. name, description, price, categories.
   * @returns {Object} Das neu erstellte Produkt-Objekt.
   * @throws {BadRequestError} Wenn kein Name oder Preis übergeben wurde.
   */
  createProduct: async function (req) {
    const { name, description, price, categories } = req.body;

    // Name und Preis sind Pflichtfelder, bei Fehlen -> BadRequestError
    if (!name || !price) {
      throw new errors.BadRequestError('Product name and price are required.');
    }

    // Alle Datenbankoperationen innerhalb einer Transaktion ausführen
    return await sails.getDatastore().transaction(async (db) => {
      // Neues Produkt anlegen
      const newProduct = await Product.create({ name, description, price })
        .fetch()
        .usingConnection(db);

      // Falls Kategorien vorhanden, Verknüpfungen in ProductCategory setzen
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
   *
   * @description
   * Lädt ein einzelnes Produkt anhand seiner ID aus der Datenbank, inklusive aller zugehörigen Kategorien und berechnet den Durchschnittswert aller Bewertungen.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Produkt-ID in req.params.id.
   * @returns {Object} Das gefundene Produkt mit allen zugehörigen Kategorien und Durchschnittsbewertung.
   * @throws {BadRequestError} Wenn keine Produkt-ID übergeben wurde.
   * @throws {NotFoundError} Wenn kein Produkt mit der übergebenen ID existiert.
   */
  findProductById: async function (req) {
    const productId = req.params.id;

    // Produkt-ID muss vorhanden sein, ansonsten BadRequestError
    if (!productId) {
      throw new errors.BadRequestError('Product ID is required.');
    }

    // Query zum Laden des Produktes, inkl. Kategorien und Durchschnittsbewertung
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

    // Wenn kein Produkt gefunden wurde, NotFoundError werfen
    if (!product) {
      throw new errors.NotFoundError('Product not found.');
    }

    // Kategorien parsen, falls vorhanden, sonst leeres Array
    const parsedCategories = product.productCategories ? JSON.parse(product.productCategories) : [];
    product.productCategories = parsedCategories.some(category => category.id !== null) ? parsedCategories : [];

    return product;
  },


  /**
   * Suche nach Produkten mit Filtern
   *
   * @description
   * Sucht Produkte anhand verschiedener optionaler Filter (Search, Kategorien, Preis, Bewertung) und unterstützt Pagination.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält Query-Parameter für Filter und Pagination.
   * @returns {Object} Ein Objekt mit einer Liste von gefundenen Produkten sowie Informationen zur Pagination.
   */
  findProducts: async function (req) {
    const { search, page, size, categories, price, rating } = extractFilters(req);
    const { whereClauses, havingClauses, queryParams } = buildQueryConditions({ search, categories, price, rating });
    let baseQuery = buildProductQuery({ whereClauses, havingClauses });

    let totalCount = 0;
    // Wenn Pagination gewünscht ist (page & size), Anzahl der Produkte ermitteln
    if (page && size) {
      const { finalCountQuery, countParams } = buildCountQuery({ search, categories, price, rating });
      const countResult = await sails.sendNativeQuery(finalCountQuery, countParams);
      totalCount = parseInt(countResult.rows[0].total, 10) || 0;
    }

    // Produkt-Query ausführen und Ergebnis zurückgeben
    return await executeProductQuery(baseQuery, queryParams, page, size, totalCount);
  },


  /**
   * Löscht ein Produkt
   *
   * @description
   * Löscht ein Produkt anhand seiner ID aus der Datenbank, inklusive aller Verknüpfungen (ProductCategory, ProductRating).
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Produkt-ID in req.params.id.
   * @throws {BadRequestError} Wenn keine Produkt-ID übergeben wurde.
   */
  deleteProduct: async function (req) {
    const productId = req.params.id;

    // Produkt-ID muss vorhanden sein, ansonsten BadRequestError
    if (!productId) {
      throw new errors.BadRequestError('Product ID is required.');
    }

    // Zuerst zugehörige JoinTable-Einträge löschen
    await ProductCategory.destroy({ product: productId });
    await ProductRating.destroy({ product: productId });

    // Dann das Produkt selbst löschen
    await Product.destroy({ id: productId });
  },


  /**
   * Aktualisiert ein Produkt
   *
   * @description
   * Aktualisiert ein bestehendes Produkt anhand seiner ID. Unterstützt auch die Neuzuweisung von Kategorien.
   * Alle Änderungen erfolgen innerhalb einer Datenbanktransaktion, sodass im Fehlerfall kein halbfertiger Zustand zurückbleibt.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Produkt-ID in req.params.id und im Body die zu aktualisierenden Felder.
   * @returns {Object} Das aktualisierte Produkt-Objekt inklusive seiner Kategorien.
   * @throws {BadRequestError} Wenn keine Produkt-ID übergeben wurde.
   * @throws {NotFoundError} Wenn kein Produkt mit der übergebenen ID existiert.
   */
  updateProduct: async function (req) {
    const productId = req.params.id;

    // Produkt-ID muss vorhanden sein
    if (!productId) {
      throw new errors.BadRequestError('Product ID is required.');
    }

    // Erwartete Daten aus dem Body
    const { name, description, price, productCategories } = req.body;

    // Produkt anhand der ID laden
    const product = await Product.findOne({ id: productId });

    // Falls Produkt nicht gefunden -> NotFoundError
    if (!product) {
      throw new errors.NotFoundError(`Product with id ${productId} not found.`);
    }

    // Update-Vorgang in einer Transaktion
    return await sails.getDatastore().transaction(async (db) => {
      // Produkt aktualisieren
      await Product.updateOne({ id: productId })
        .set({ name, description, price })
        .usingConnection(db);

      // Kategorien neu setzen, falls übergeben
      if (productCategories) {
        await ProductCategory.destroy({ product: productId }).usingConnection(db);
        const newCategories = productCategories.map((categoryId) => ({
          product: productId,
          category: categoryId
        }));
        await ProductCategory.createEach(newCategories).usingConnection(db);
      }

      // Aktualisiertes Produkt mit Kategorien zurückgeben
      return await Product.findOne({ id: productId }).populate('productCategories').usingConnection(db);
    });
  }
};




/******************************************************************************************************
 * ProductService Helper Methods
 *
 * @description   Server-side helper functions for handling business logic of products.
 *                Diese Hilfsfunktionen werden nicht exportiert und sind nur intern im Service nutzbar.
 *
 ******************************************************************************************************/

/**
 * Extrahiert/Validiere die Filter- und Pagination-Parameter aus dem Request.
 *
 * @param {Request} req - Der eingehende HTTP-Request mit möglichen Query-Parametern (search, page, size, categories, price, rating).
 * @returns {Object} Ein Objekt mit den extrahierten Parametern (search, page, size, categories, price, rating).
 */
function extractFilters(req) {
  const search = req.query.search ? `%${req.query.search}%` : null;
  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const size = req.query.size ? parseInt(req.query.size, 10) : null;
  const categories = req.query.categories
    ? req.query.categories.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    : null;
  const price = (req.query.price && parseFloat(req.query.price) !== 0)
    ? parseFloat(req.query.price)
    : null;
  const rating = req.query.rating ? parseInt(req.query.rating) : null;

  return { search, page, size, categories, price, rating };
}


/**
 * Baut die WHERE- und HAVING-Bedingungen für die Produkt-Query basierend auf den ganzen verschiedenen Filtern auf.
 *
 * @param {Object} filters - Ein Objekt mit den Filtern (search, categories, price, rating).
 * @returns {Object} Ein Objekt mit den Arrays für WHERE- und HAVING-Klauseln, den Query-Parametern und dem aktuellen Param-Index.
 */
function buildQueryConditions({ search, categories, price, rating }) {
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

  if (rating !== null && !isNaN(rating)) {
    havingClauses.push(`averageRating >= $${paramIndex}`);
    queryParams.push(rating);
    paramIndex++;
  }

  return { whereClauses, havingClauses, queryParams, paramIndex };
}


/**
 * Erstellt die Count-Query, um die Gesamtzahl der Produkte zu ermitteln, welche den angegebenen Filtern entsprechen.
 * Dies ist für die Pagination notwendig!
 *
 * @param {Object} filters - Ein Objekt mit den Filtern (search, categories, price, rating).
 * @returns {Object} Ein Objekt mit der finalen Count-Query (finalCountQuery) und den zugehörigen Parametern (countParams).
 */
function buildCountQuery({ search, categories, price, rating }) {
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

  return { finalCountQuery, countParams };
}


/**
 * Baut die eigentliche Produkt-Query auf Basis der WHERE- und HAVING-Bedingungen auf
 * inklusive aller zugehörigen Kategorien und berechnet den Durchschnittswert aller Bewertungen.
 *
 * @param {Object} conditions - Ein Objekt mit WHERE- und HAVING-Klauseln.
 * @param {Array} conditions.whereClauses - Array der WHERE-Bedingungen.
 * @param {Array} conditions.havingClauses - Array der HAVING-Bedingungen.
 * @returns {String} Die zusammengesetzte SQL-Query für die Produktsuche.
 */
function buildProductQuery({ whereClauses, havingClauses }) {
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

  if (whereClauses.length > 0) {
    baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  baseQuery += ` GROUP BY p.id`;

  if (havingClauses.length > 0) {
    baseQuery += ` HAVING ${havingClauses.join(' AND ')}`;
  }

  return baseQuery;
}


/**
 * Führt die Produkt-Query aus, bereitet das Ergebnis auf und gibt es formatiert zurück.
 * Bei Bedarf wird zudem Pagination angewendet bzw Paginationwerte zurueckgelierfert.
 *
 * @param {String} baseQuery - Die fertige SQL-Query zum Abruf der Produkte.
 * @param {Array} queryParams - Die Parameter für die Prepared Statement Query.
 * @param {Number|null} page - Die aktuelle Seite für die Pagination (falls vorhanden).
 * @param {Number|null} size - Die Anzahl der Elemente pro Seite (falls vorhanden).
 * @param {Number} totalCount - Die Gesamtanzahl der zur Verfügung stehenden Produkte.
 * @returns {Object} Ein Objekt mit den gefundenen Produkten und ggf. Pagination-Informationen.
 */
async function executeProductQuery(baseQuery, queryParams, page, size, totalCount) {
  // Pagination anwenden, falls page & size vorhanden
  if (page && size) {
    queryParams.push(size, (page - 1) * size);
    baseQuery += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  const products = await sails.sendNativeQuery(baseQuery, queryParams);

  // Kategorien-Feld in Objektform parsen
  const results = products.rows.map(product => ({
    ...product,
    productCategories: JSON.parse(product.productCategories || '[]')
  }));

  // Wenn Pagination aktiv, zusätzliche Informationen zurückgeben
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
}
