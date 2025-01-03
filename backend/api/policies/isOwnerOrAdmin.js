/**
 * isOwnerOrAdmin
 *
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function(req, res, proceed) {
  const userId = req.session.userId;

  if (!userId) {
    return res.sendStatus(401);
  }

  const user = await User.findOne({ id: userId });

  if (!user) {
    return res.sendStatus(404);
  }

  // Administratoren dürfen alle Daten sehen
  if (user.isAdmin) {
    return proceed();
  }

  // Für Aktionen mit spezifischem Benutzer (z.B. findOne), vergleiche die ID
  const targetUserId = req.params.id;

  if (targetUserId && targetUserId === userId) {
    return proceed();
  }

  // Benutzer versucht, auf fremde Daten zuzugreifen
  return res.sendStatus(403);
};
