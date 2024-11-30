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
    let product = await Product.findOne({ id: req.params.id });
    res.json(product);
  },
  destroy: async function (req, res) {
    sails.log.debug('Delete Product....');
    await Product.destroy({ id: req.params.id });
    res.ok();
  },
};

