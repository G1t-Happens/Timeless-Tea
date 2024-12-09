/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 */
const ProductService = require('../services/ProductService');
const errors = require('../utils/errors');

module.exports = {
  /**
   * Erstellt ein Produkt
   */
  create: async function (req, res) {
    try {
      const product = await ProductService.createProduct(req);
      return res.status(201).json(product);
    } catch (err) {
      sails.log.error('Error:', err.message);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * Ruft ein Produkt anhand der ID ab
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
   * Ruft alle Produkte ab
   */
  find: async function (req, res) {
    try {
      const result = await ProductService.findProducts(req);
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
   * Löscht ein Produkt anhand der ID
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
   * Aktualisiert ein Produkt
   */
  patch: async function (req, res) {
    try {
      const updatedProduct = await ProductService.updateProduct(req);
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
