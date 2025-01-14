/**
 * isOwnerOrAdmin
 *
 * Erlaubt Zugriff, wenn der Benutzer entweder ein Admin ist oder seine eigenen Daten bearbeitet.
 */
module.exports = async function (req, res, proceed) {
  const userId = req.session.userId;

  // Kein Benutzer angemeldet
  if (!userId) {
    return res.sendStatus(401);
  }

  // Benutzer aus der Datenbank abrufen
  const user = await User.findOne({ id: userId });

  // Benutzer existiert nicht
  if (!user) {
    return res.sendStatus(404);
  }

  // Admin hat immer Zugriff
  if (user.isAdmin) {
    return proceed();
  }

  // Überprüfen, ob der Benutzer seine eigenen Daten bearbeitet
  const targetUserId = req.params.id;

  // Ziel-Benutzer-ID vorhanden und entspricht der angemeldeten Benutzer-ID
  if (targetUserId && String(targetUserId) === String(userId)) {
    return proceed();
  }

  // Benutzer versucht auf fremde Daten zuzugreifen
  return res.sendStatus(403);
};
