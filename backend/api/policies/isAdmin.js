
/**
 * isSuperAdmin
 *
 * A simple policy that blocks requests from non-admins.
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  if (!req.session) {return res.sendStatus(401);}
  if (!req.session.userId) { return res.sendStatus(401); }
  if (!req.session.user.isAdmin) { return res.sendStatus(401); }

  // User is LoggedIn and Admin
  return proceed();
};


