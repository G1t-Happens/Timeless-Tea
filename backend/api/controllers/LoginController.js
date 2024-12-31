/**
 * LoginController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  login: async function (req, res) {
    let params = req.body;
    let user = await User.findOne({
      emailAddress: params.emailAddress.toLowerCase(),
    });
    // If there was no matching user, respond thru the "badCombo" exit.
    if (!user) {
      throw 'badCombo';
    }
    // If the password doesn't match, then also exit thru "badCombo".
    await sails.helpers.passwords
      .checkPassword(params.password, user.password)
      .intercept('incorrect', 'badCombo');
    // Modify the active session instance.
    req.session.userId = user.id;
    req.session.user = user;
    return res.json(user);
  },
  sessionUser: async function (req, res) {
    let user = req.session.user;
    if (!user) {
      res.status(403);
    }
    return res.json(user);
  },
  register: async function (req, res) {
    let params = req.body;
    let newEmailAddress = params.emailAddress.toLowerCase();

    let user = await User.create(
      { emailAddress: newEmailAddress, firstName: params.firstName, lastName: params.lastName,
        isAdmin:false, password: await sails.helpers.passwords.hashPassword(params.password),
      }).intercept('E_UNIQUE', 'emailAlreadyInUse')
      .intercept({name: 'UsageError'}, 'invalid')
      .fetch();

    // Store the user's new id in their session.
    req.session.userId = user.id;
    req.session.user = user;
    return res.json(user);
  },
  logout: async function (req, res) {
    delete req.session.user;
    delete req.session.userId;
    return res.ok();
  },
};

