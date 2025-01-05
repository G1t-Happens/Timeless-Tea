// api/services/UserService.js

const errors = require('../utils/errors');

/**
 * UserService
 *
 * @description :: Server-side functions for handling user-related business logic.
 */
module.exports = {

  /**
   * Erstellt einen neuen Benutzer
   *
   * @description
   * Erstellt einen neuen Benutzer in der Datenbank und sichert das Passwort.
   * Die Erstellung erfolgt in einer Datenbanktransaktion, sodass im Fehlerfall kein halbfertiger Zustand zurückbleibt.
   *
   * @param {Request} req - Der eingehende HTTP-Request von Sails, enthält im Body u.a. emailAddress, password, firstName, lastName, isAdmin.
   * @returns {Object} Das neu erstellte Benutzer-Objekt ohne Passwort.
   * @throws {BadRequestError} Wenn erforderliche Felder fehlen oder ungültig sind.
   * @throws {ConflictError} Wenn die E-Mail-Adresse bereits existiert.
   */
  createUser: async function (req) {
    const { emailAddress, password, firstName, lastName, isAdmin } = req.body;

    // Validierung der erforderlichen Felder
    if (!emailAddress || !password || !firstName || !lastName) {
      throw new errors.BadRequestError('E-Mail-Adresse, Passwort, Vorname und Nachname sind erforderlich.');
    }

    // Überprüfen, ob die E-Mail-Adresse bereits existiert
    const existingUser = await User.findOne({ emailAddress });
    if (existingUser) {
      throw new errors.ConflictError('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.');
    }

    // Passwort hashen
    const hashedPassword = await sails.helpers.passwords.hashPassword(password);

    // Datenbankoperationen innerhalb einer Transaktion
    return await sails.getDatastore().transaction(async (db) => {
      const newUser = await User.create({
        emailAddress,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: isAdmin || false
      })
        .fetch()
        .usingConnection(db);

      // Entferne das Passwort aus dem Rückgabewert
      delete newUser.password;

      return newUser;
    });
  },

  /**
   * Ruft einen Benutzer anhand seiner ID ab
   *
   * @description
   * Lädt einen einzelnen Benutzer anhand seiner ID aus der Datenbank.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Benutzer-ID in req.params.id.
   * @returns {Object} Der gefundene Benutzer ohne Passwort.
   * @throws {BadRequestError} Wenn keine Benutzer-ID übergeben wurde.
   * @throws {NotFoundError} Wenn kein Benutzer mit der übergebenen ID existiert.
   */
  findUserById: async function(req) {
    const userId = req.params.id;

    // Benutzer-ID muss vorhanden sein, ansonsten BadRequestError
    if (!userId) {
      throw new errors.BadRequestError('Benutzer-ID ist erforderlich.');
    }

    const user = await User.findOne({ id: userId })
      .populate('orders')
      .populate('address')
      .populate('payment');

    // Wenn kein Benutzer gefunden wurde, NotFoundError werfen
    if (!user) {
      throw new errors.NotFoundError('Benutzer nicht gefunden.');
    }

    // Entferne das Passwort aus dem Rückgabewert
    delete user.password;

    return user;
  },

  /**
   * Suche nach Benutzern mit Filtern
   *
   * @description
   * Sucht Benutzer anhand eines optionalen Suchstrings nach Namen und unterstützt Pagination.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält Query-Parameter für Suche und Pagination.
   * @returns {Object} Ein Objekt mit einer Liste von gefundenen Benutzern sowie Informationen zur Pagination.
   */
  findUsers: async function(req) {
    const { search, page, size } = extractUserFilters(req);

    const criteria = {
      where: {},
      sort: 'id ASC'
    };

    if (search) {
      criteria.where.or = [
        { firstName: { contains: search } },
        { lastName: { contains: search } }
      ];
    }

    if (page !== null && size !== null) {
      criteria.limit = size;
      criteria.skip = (page - 1) * size;
    }

    // Ensure no dot notation is used here
    let users = await User.find(criteria);

    const sanitizedUsers = users.map(user => {
      delete user.password;
      return user;
    });

    let totalCount = 0;

    if (page !== null && size !== null) {
      totalCount = await User.count(criteria.where);
    }

    if (page !== null && size !== null) {
      const totalPages = Math.ceil(totalCount / size);
      return {
        users: sanitizedUsers,
        total: totalCount,
        totalPages: totalPages,
        currentPage: page,
        hasMore: page < totalPages
      };
    } else {
      return {
        users: sanitizedUsers,
        total: sanitizedUsers.length
      };
    }
  },

  /**
   * Aktualisiert einen bestehenden Benutzer
   *
   * @description
   * Aktualisiert einen bestehenden Benutzer anhand seiner ID. Unterstützt auch die Aktualisierung von Adresse und Zahlungsmethoden.
   * Alle Änderungen erfolgen innerhalb einer Datenbanktransaktion, sodass im Fehlerfall kein halbfertiger Zustand zurückbleibt.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Benutzer-ID in req.params.id und im Body die zu aktualisierenden Felder.
   * @returns {Object} Das aktualisierte Benutzer-Objekt ohne Passwort.
   * @throws {BadRequestError} Wenn keine Benutzer-ID übergeben wurde.
   * @throws {NotFoundError} Wenn kein Benutzer mit der übergebenen ID existiert.
   * @throws {ConflictError} Wenn die neue E-Mail-Adresse bereits von einem anderen Benutzer verwendet wird.
   */
  updateUser: async function (req) {
    const userId = req.params.id;

    // Benutzer-ID muss vorhanden sein
    if (!userId) {
      throw new errors.BadRequestError('Benutzer-ID ist erforderlich.');
    }

    // Erwartete Daten aus dem Body
    const { emailAddress, password, firstName, lastName, isAdmin, address, payment } = req.body;

    // Benutzer anhand der ID laden
    const user = await User.findOne({ id: userId });

    // Falls Benutzer nicht gefunden -> NotFoundError
    if (!user) {
      throw new errors.NotFoundError(`Benutzer mit ID ${userId} nicht gefunden.`);
    }

    // Überprüfen, ob die neue E-Mail-Adresse bereits von einem anderen Benutzer verwendet wird
    if (emailAddress && emailAddress !== user.emailAddress) {
      const existingUser = await User.findOne({ emailAddress });
      if (existingUser) {
        throw new errors.ConflictError('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.');
      }
    }

    // Passwort hashen, falls es aktualisiert wird
    let hashedPassword;
    if (password) {
      hashedPassword = await sails.helpers.passwords.hashPassword(password);
    }

    // Datenbankoperationen innerhalb einer Transaktion
    return await sails.getDatastore().transaction(async (db) => {
      try {
        // Benutzer aktualisieren
        const updatedUser = await User.updateOne({ id: userId })
          .set({
            emailAddress: emailAddress || user.emailAddress,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            isAdmin: typeof isAdmin === 'boolean' ? isAdmin : user.isAdmin,
            password: hashedPassword || user.password
          })
          .usingConnection(db);

        // Adresse aktualisieren, falls übergeben
        if (address) {
          if (updatedUser.address) {
            await Address.updateOne({ id: updatedUser.address })
              .set(address)
              .usingConnection(db);
          } else {
            const newAddress = await Address.create(address)
              .fetch()
              .usingConnection(db);
            await User.updateOne({ id: userId })
              .set({ address: newAddress.id })
              .usingConnection(db);
          }
        }

        // Zahlungsmethoden aktualisieren, falls übergeben
        if (payment) {
          if (updatedUser.payment) {
            await Payment.updateOne({ id: updatedUser.payment })
              .set(payment)
              .usingConnection(db);
          } else {
            const newPayment = await Payment.create(payment)
              .fetch()
              .usingConnection(db);
            await User.updateOne({ id: userId })
              .set({ payment: newPayment.id })
              .usingConnection(db);
          }
        }

        // Lade den aktualisierten Benutzer inklusive Beziehungen
        const finalUser = await User.findOne({ id: userId })
          .populate('orders')
          .populate('address')
          .populate('payment')
          .usingConnection(db);

        // Entferne das Passwort aus dem Rückgabewert
        delete finalUser.password;

        return finalUser;
      } catch (err) {
        sails.log.error('Error during updateUser transaction:', err);
        throw new errors.CustomError('Fehler beim Aktualisieren des Benutzers.', 500);
      }
    });
  },

  /**
   * Löscht einen Benutzer
   *
   * @description
   * Löscht einen Benutzer anhand seiner ID aus der Datenbank, inklusive aller Verknüpfungen (Orders).
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Benutzer-ID in req.params.id.
   * @throws {BadRequestError} Wenn keine Benutzer-ID übergeben wurde.
   */
  deleteUser: async function (req) {
    const userId = req.params.id;

    // Benutzer-ID muss vorhanden sein
    if (!userId) {
      throw new errors.BadRequestError('Benutzer-ID ist erforderlich.');
    }

    // Datenbankoperationen innerhalb einer Transaktion
    return await sails.getDatastore().transaction(async (db) => {
      try {
        // Zuerst zugehörige Bestellungen löschen
        await Order.destroy({ user: userId }).usingConnection(db);

        // Dann den Benutzer selbst löschen
        await User.destroy({ id: userId }).usingConnection(db);

      } catch (err) {
        sails.log.error('Error during deleteUser transaction:', err);
        throw new errors.CustomError('Fehler beim Löschen des Benutzers.', 500);
      }
    });
  },

  countUsers: async function () {
    return await User.count();
  }

};

/******************************************************************************************************
 * UserService Helper Methods
 *
 * @description   Server-side helper functions for handling business logic of users.
 *                Diese Hilfsfunktionen werden nicht exportiert und sind nur intern im Service nutzbar.
 *
 ******************************************************************************************************/

/**
 * Extrahiert/Validiere die Filter- und Pagination-Parameter aus dem Request für Benutzer.
 *
 * @param {Request} req - Der eingehende HTTP-Request mit möglichen Query-Parametern (search, page, size).
 * @returns {Object} Ein Objekt mit den extrahierten Parametern (search, page, size).
 */
function extractUserFilters(req) {
  const search = req.query.search ? req.query.search.trim() : null;
  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const size = req.query.size ? parseInt(req.query.size, 10) : null;

  return { search, page, size };
}
