/**
 * CategoryController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
  find: async function(req, res) {
    try {
      const categories = await Category.find();
      return res.json(categories);
    } catch (err) {
      return res.serverError(err.toString());
    }
  }
};

