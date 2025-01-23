const errors = require('../utils/errors');
const { v2: cloudinary } = require('cloudinary');


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
    const { name, description, categories, price, quantity } = req.body;

    if (!name || !price || !quantity) {
      throw new errors.BadRequestError('Product name and price are required.');
    }

    const optimizedUrl = await uploadFileToCloudinary(req, 'image');

    // Kategorien validieren und verarbeiten
    let categoryArray = [];
    if (categories) {
      // Kategorien verarbeiten (String -> Array)
      categoryArray = typeof categories === 'string' ? JSON.parse(categories) : categories;
      // Prüfen, ob alle Elemente numerisch sind
      if (!Array.isArray(categoryArray) || categoryArray.some((id) => typeof id !== 'number')) {
        throw new errors.BadRequestError('Categories must be an array of numeric IDs.');
      }
    }

    // Datenbankoperationen innerhalb einer Transaktion
    return await sails.getDatastore().transaction(async (db) => {
      const newProduct = await Product.create({ name, description, price, quantity, image: optimizedUrl })
        .fetch()
        .usingConnection(db);

      if (categoryArray.length > 0) {
        const productCategories = categoryArray.map((categoryId) => ({
          product: newProduct.id,
          category: categoryId,
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
    // Prüfen, ob der Benutzer Admin ist
    const isAdmin = checkIsAdmin(req);

    // Produkt-ID muss vorhanden sein, ansonsten BadRequestError
    if (!productId) {
      throw new errors.BadRequestError('Product ID is required.');
    }

    // Normale User duerfen keine "soft-deleted"-Produkte angeboten bekommen, nur Admins sollen alles sehen
    let deleteFilter = '';
    if (!isAdmin) {
      deleteFilter = 'AND p.isDeleted = false';
    }

    // Query zum Laden des Produktes, inkl. Kategorien und Durchschnittsbewertung
    // Hier hängen wir den Filter für isDeleted an die WHERE-Klausel an
    const query = `
    SELECT p.id,
           p.name,
           p.description,
           p.price,
           p.quantity,
           p.image,
           p.isDeleted,
           COUNT(pr.rating) AS "reviews",
           COALESCE(AVG(r.stars), 0) AS "averageRating",
           (
             SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'id', unique_categories.id,
                        'name', unique_categories.name,
                        'type', unique_categories.type
                      )
                    )
             FROM (
                    SELECT DISTINCT c.id, c.name, c.type
                    FROM productcategory pc
                           JOIN category c ON pc.category = c.id
                    WHERE pc.product = p.id
                  ) AS unique_categories
           ) AS "productCategories"
    FROM product p
           LEFT JOIN productrating pr ON p.id = pr.product
           LEFT JOIN rating r ON pr.rating = r.id
    WHERE p.id = $1
      ${deleteFilter}
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
    const isAdmin = checkIsAdmin(req);
    const { search, page, size, categories, price, rating } = extractFilters(req);
    const { whereClauses, havingClauses, queryParams } = buildQueryConditions({ search, categories, price, rating, isAdmin });
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

    // Soft-Delete durchführen
    await Product.updateOne({ id: productId }).set({ isDeleted: true });
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
    const { name, description, categories, price, quantity, isDeleted } = req.body;

    // Produkt anhand der ID laden
    const product = await Product.findOne({ id: productId });

    // Falls Produkt nicht gefunden -> NotFoundError
    if (!product) {
      throw new errors.NotFoundError(`Product with id ${productId} not found.`);
    }

    //Hochladen der
    const optimizedUrl = await uploadFileToCloudinary(req, 'image', product.image);

    // Kategorien validieren und verarbeiten
    let categoryArray = [];
    if (categories) {
      // Kategorien verarbeiten (String -> Array)
      categoryArray = typeof categories === 'string' ? JSON.parse(categories) : categories;
      // Prüfen, ob alle Elemente numerisch sind
      if (!Array.isArray(categoryArray) || categoryArray.some((id) => typeof id !== 'number')) {
        throw new errors.BadRequestError('Categories must be an array of numeric IDs.');
      }
    }

    // Update-Vorgang in einer Transaktion
    return await sails.getDatastore().transaction(async (db) => {
      // Produkt aktualisieren
      await Product.updateOne({ id: productId })
        .set({ name, description, price, quantity, isDeleted, image: optimizedUrl })
        .usingConnection(db);

      // Kategorien neu setzen, falls übergeben
      await ProductCategory.destroy({ product: productId }).usingConnection(db);
      const newCategories = categoryArray.map((categoryId) => ({
        product: productId,
        category: categoryId
      }));
      await ProductCategory.createEach(newCategories).usingConnection(db);
      // Aktualisiertes Produkt mit Kategorien zurückgeben
      return await Product.findOne({ id: productId }).populate('productCategories').usingConnection(db);
    });
  },

  /**
   * Zaehlt die Produkt
   *
   * @description
   * Zaehlt alle vorhandenen Produkte in der Datenbank und liefert die Anzahl zurueck
   *
   */
  countArticles: async function () {
    // Zähle die Anzahl der Artikel
    return await Product.count();
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
function buildQueryConditions({ search, categories, price, rating, isAdmin }) {
  let whereClauses = []; // Standard-Filter für die WHERE-Bedingungen
  let havingClauses = [];
  let queryParams = [];
  let paramIndex = 1;

  // Filter für isDeleted abhängig von isAdmin
  if (!isAdmin) {
    whereClauses.push('p.isDeleted = false');
  }

  // Suchbegriff hinzufügen
  if (search) {
    whereClauses.push(`p.name LIKE $${paramIndex}`);
    queryParams.push(search);
    paramIndex++;
  }

  // Filter für Kategorien hinzufügen
  if (categories && categories.length > 0) {
    const categoryPlaceholders = categories.map(() => `$${paramIndex++}`).join(',');
    whereClauses.push(`c.id IN (${categoryPlaceholders})`);
    queryParams.push(...categories);
  }

  // Filter für Preis hinzufügen
  if (price !== null && !isNaN(price)) {
    whereClauses.push(`p.price <= $${paramIndex}`);
    queryParams.push(price);
    paramIndex++;
  }

  // Filter für Bewertung hinzufügen
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
           (
             SELECT COUNT(DISTINCT pr.id)
             FROM productrating pr
             WHERE pr.product = p.id
           ) AS "reviews",
           COALESCE(AVG(r.stars), 0) AS averageRating,
           (
             SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'id', unique_categories.id,
                        'name', unique_categories.name,
                        'type', unique_categories.type
                      )
                    )
             FROM (
                    SELECT DISTINCT c.id, c.name, c.type
                    FROM productcategory pc
                           JOIN category c ON pc.category = c.id
                    WHERE pc.product = p.id
                  ) AS unique_categories
           ) AS productCategories
    FROM product p
           LEFT JOIN productrating pr ON p.id = pr.product
           LEFT JOIN rating r ON pr.rating = r.id
           LEFT JOIN productcategory pc ON p.id = pc.product
           LEFT JOIN category c ON pc.category = c.id
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

/**
 * Lädt eine Datei zu Cloudinary hoch und gibt die URL zurück
 *
 * @param {object} req - Das Sails.js-Request-Objekt
 * @param {string} fieldName - Der Name des Datei-Feldes im Request
 * @param {null} productImage - (Optional) Backup Image, falls Cloudinary upload fehlschlaegt
 * @returns {Promise<string>} - Die URL der hochgeladenen und optimierten Datei
 * @throws {errors.BadRequestError} - Wenn keine Datei hochgeladen wurde oder ein Fehler auftritt
 */
async function uploadFileToCloudinary(req, fieldName, productImage = '') {
  const upstream = req.file(fieldName);
  const newFile = upstream._files[0];

  if (newFile) {
    // Konfig
    cloudinary.config(sails.config);

    // Holen der hochgeladenen file oder Fehler werfen
    const file = await new Promise((resolve, reject) =>
      req.file(fieldName).upload((err, files) =>
        err || !files.length ? reject(new errors.BadRequestError('No file uploaded.')) : resolve(files[0])
      )
    );

    // Hochladen der File in Cloudinary und URL zurueckliefern
    const { public_id } = await cloudinary.uploader.upload(file.fd, { public_id: `product/${Date.now()}` });
    return cloudinary.url(public_id, { fetch_format: 'auto', quality: 'auto' });
  } else {
    // Keine neue Datei: Bestehendes Bild zurückgeben oder `null` falls nichts übergeben wurde
    upstream.noMoreFiles();
    return productImage;
  }
}

/**
 * Prüft, ob der aktuelle Benutzer ein Admin ist
 *
 * @param {Request} req - Der eingehende HTTP-Request von Sails.js
 * @returns {boolean} - `true`, wenn der Benutzer ein Admin ist, ansonsten `false`
 */
function checkIsAdmin(req) {
  // Sicherheitsprüfung: Ist der Benutzer eingeloggt und hat eine gültige Session?
  if (!req.session || !req.session.user) {
    return false;
  }

  // Rückgabe, ob der Benutzer ein Admin ist
  return req.session.user.isAdmin === true;
}


