/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests related to Products.
 */
const errors = require('../utils/errors');

module.exports = {

  /**
   * `ProductController.create()`
   *
   * @description
   * Erstellt ein neues Produkt anhand der im Request-Body übergebenen Daten.
   * Gibt bei Erfolg das neu erstellte Produkt (HTTP 201 Created) zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit Produktdaten im Body.
   * @param {Response} res - Die HTTP-Response, um das Ergebnis zurückzugeben.
   * @returns {Response} Das neu erstellte Produkt oder ein Fehlerstatus.
   */
  create: async function (req, res) {
    try {
      const product = await ProductService.createProduct(req);
      return res.status(201).json(product);
    } catch (err) {
      sails.log.error('Error:', err.message);

      // Falls es sich um einen definierten CustomError handelt, wird der entsprechende Statuscode
      // + custom message zurückgegeben.
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      // Bei unerwarteten Fehlern wird ein allgemeiner Serverfehler zurückgegeben.
      return res.serverError('An unexpected error occurred.');
    }
  },


  /**
   * `ProductController.findOne()`
   *
   * @description
   * Lädt ein einzelnes Produkt anhand der übergebenen Produkt-ID im `req.params.id`.
   * Gibt das gefundene Produkt (HTTP 200 OK) oder einen Fehlerstatus zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Produkt-ID in den URL-Parametern.
   * @param {Response} res - Die HTTP-Response, um das gefundene Produkt zurückzugeben.
   * @returns {Response} Das gefundene Produkt oder ein Fehlerstatus.
   */
  findOne: async function (req, res) {
    try {
      const product = await ProductService.findProductById(req);
      return res.json(product);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },


  /**
   * `ProductController.find()`
   *
   * @description
   * Sucht nach Produkten anhand optionaler Filter (z. B. Suchstring, Kategorie, Preis, Bewertung)
   * sowie optionaler Pagination-Parameter (Seite und Größe).
   * Gibt eine Liste von Produkten sowie ggf. Pagination-Informationen zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit optionalen Query-Parametern für Filter und Pagination.
   * @param {Response} res - Die HTTP-Response, um das Suchergebnis zurückzugeben.
   * @returns {Response} Das Suchergebnis mit Produkten und optionalen Meta-Informationen.
   */
  find: async function (req, res) {
    try {
      const result =  await ProductService.findProducts(req);
      return res.json(result);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },


  /**
   * `ProductController.destroy()`
   *
   * @description
   * Löscht ein Produkt anhand der übergebenen Produkt-ID im `req.params.id`.
   * Gibt bei Erfolg HTTP 200 OK zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Produkt-ID in den URL-Parametern.
   * @param {Response} res - Die HTTP-Response zur Bestätigung der Löschung.
   * @returns {Response} Eine leere Antwort mit Status 200 oder ein Fehlerstatus.
   */
  destroy: async function (req, res) {
    try {
      await ProductService.deleteProduct(req);
      return res.ok();
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },


  /**
   * `ProductController.patch()`
   *
   * @description
   * Aktualisiert ein bestehendes Produkt anhand der übergebenen Produkt-ID und/oder weiteren Feldern im Request-Body.
   * Gibt das aktualisierte Produkt (HTTP 200 OK) zurück.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit der Produkt-ID in den URL-Parametern und aktualisierten Daten im Body.
   * @param {Response} res - Die HTTP-Response, um das aktualisierte Produkt zurückzugeben.
   * @returns {Response} Das aktualisierte Produkt oder ein Fehlerstatus.
   */
  patch: async function (req, res) {
    try {
      const updatedProduct =  await ProductService.updateProduct(req);
      return res.json(updatedProduct);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  }
};
