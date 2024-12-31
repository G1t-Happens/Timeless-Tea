const errors = require('../utils/errors');

/**
 * LoginService.js
 *
 * @description :: Service für Login, Registrierung, Session-Verwaltung und Logout.
 *                 Die eigentliche Business-Logik und Datenbankzugriffe werden hier gekapselt.
 */



module.exports = {
  /**
   * loginUser(emailAddress, password)
   *
   * @description
   * Findet einen User per E-Mail-Adresse, überprüft das Passwort mithilfe von Sails-Helper,
   * wirft Fehler, wenn der User nicht gefunden wird oder das Passwort falsch ist.
   *
   * @param {string} emailAddress - Die E-Mail-Adresse des Users
   * @param {string} password - Das eingegebene Passwort
   * @returns {Object} Der gefundene User (ohne Passwort)
   * @throws {NotFoundError|UnauthorizedError} Wirft entsprechende Fehler, falls Benutzer nicht existiert oder das Passwort nicht stimmt
   */
  loginUser: async function (emailAddress, password) {
    // User anhand der E-Mail-Adresse suchen
    let user = await User.findOne({
      emailAddress: emailAddress.toLowerCase(),
    });

    // Falls kein User gefunden wurde, NotFoundError werfen
    if (!user) {
      throw new errors.NotFoundError('User not found');
    }

    // Passwort überprüfen (Sails Helper checkPassword)
    await sails.helpers.passwords
        .checkPassword(password, user.password)
        .intercept('incorrect', () => {
          // Falls das Passwort nicht stimmt, wird hier ein UnauthorizedError geworfen
          throw new errors.UnauthorizedError('Incorrect password');
        });

    // Gebe den User zurück falls gefunden und authorisiert
    return user;
  },

  /**
   * getSessionUser(session)
   *
   * @description
   * Liest den User aus der Session aus.
   *
   * @param {Object} session - Die aktuelle Session (req.session)
   * @returns {Object} Der User aus der Session
   * @throws {UnauthorizedError} Falls kein User in der Session vorhanden ist
   */
  getSessionUser: function (session) {
    if (!session.user) {
      // Falls kein User in der Session, Fehler werfen
      throw new errors.ForbiddenError('No user in session');
    }
    return session.user;
  },

  /**
   * registerUser(params, session)
   *
   * @description
   * Erstellt einen neuen User in der Datenbank und schreibt ihn in die Session.
   *
   * @param {Object} params - Die Registrierungsdaten (emailAddress, firstName, lastName, password, ...)
   * @param {Object} session - Die aktuelle Session (req.session)
   * @returns {Object} Der neu erstellte User
   * @throws {BadRequestError} Falls z. B. die E-Mail schon belegt ist oder andere Validierungsfehler auftreten
   */
  registerUser: async function (params, session) {
    let newEmailAddress = params.emailAddress.toLowerCase();
    let user;

    // User in der Datenbank anlegen
    user = await User.create({
      emailAddress: newEmailAddress,
      firstName: params.firstName,
      lastName: params.lastName,
      isAdmin: false,
      password: await sails.helpers.passwords.hashPassword(params.password),
    })
        .intercept('E_UNIQUE', () => {
          // Falls die E-Mail schon in Benutzung ist
          throw new errors.BadRequestError('Email already in use');
        })
        .intercept({ name: 'UsageError' }, () => {
          // Falls Validierungsfehler auftreten
          throw new errors.BadRequestError('Invalid data');
        })
        .fetch();

    // User in die Session schreiben
    session.userId = user.id;
    session.user = user;

    return user;
  },

  /**
   * logoutUser(session)
   *
   * @description
   * Entfernt den eingeloggten User aus der Session.
   *
   * @param {Object} session - Die aktuelle Session (req.session)
   */
  logoutUser: function (session) {
    delete session.userId;
    delete session.user;
  },
};
