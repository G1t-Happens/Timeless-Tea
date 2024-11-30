/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async function (req, res) {
    sails.log.debug('Create Product....');
    let params = req.allParams();
    await Product.create(params);
    res.ok();
  },
  find: async function (req, res) {
    sails.log.debug('List all Products....');
    let products = await Product.find();
    return res.json(products);
  },
  findOne: async function (req, res) {
    sails.log.debug('List single Product....');
    //let product = await Product.findOne({ id: req.params.id });
    let product = await Product.findOne({ id: req.params.id }).populate('categories');
    res.json(product);
  },
  // findOneWithAverageStars: async function (req, res) {
  //   sails.log.debug('List single Product....');
  //
  //   // Zuerst das Produkt mit den zugehörigen Kategorien laden
  //   let product = await Product.findOne({ id: req.params.id }).populate('categories');
  //
  //   if (!product) {
  //     return res.status(404).json({ error: 'Produkt nicht gefunden' });
  //   }
  //
  //   // SQL-Abfrage zur Berechnung des Durchschnitts der Bewertungen für das Produkt
  //   var averageRatingSQL = `
  //     SELECT AVG(stars) AS averageRating
  //     FROM rating
  //     WHERE product = $1
  //   `;
  //
  //   let rawResult = await sails.sendNativeQuery(averageRatingSQL, [product.id]);
  //
  //   let averageRating = 0;
  //   if (rawResult.rows && rawResult.rows.length > 0) {
  //     averageRating = rawResult.rows[0].averageRating || 0;
  //   }
  //
  //   product.averageRating = averageRating;
  //
  //   return res.json(product);
  // },
  destroy: async function (req, res) {
    sails.log.debug('Delete Product....');
    await Product.destroy({ id: req.params.id });
    res.ok();
  },
};

