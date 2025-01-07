// api/services/UserService.js

const errors = require('../utils/errors');

/**
 * UserService
 *
 * @description :: Server-side functions for handling user-related business logic.
 */
module.exports = {
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
    sails.log("Hello World");
    const userId = req.params.id;

    // 1) Prüfen, ob userId überhaupt existiert
    if (!userId) {
      throw new errors.BadRequestError('Benutzer-ID ist erforderlich.');
    }

    // 2) Daten aus dem Request-Body extrahieren
    const { emailAddress, password, firstName, lastName, isAdmin, addressData, paymentData } = req.body;

    // 3) User laden (inkl. Address und Payment), um dessen IDs zu haben
    const existingUser = await User.findOne({ id: userId })
      .populate('address')
      .populate('payment');

    sails.log.error("addressData");
    sails.log.error(addressData);

    if (!existingUser) {
      throw new errors.NotFoundError(`Benutzer mit ID ${userId} nicht gefunden.`);
    }

    // 4) Passwort ggf. hashen
    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await sails.helpers.passwords.hashPassword(password);
    }

    // 5) Transaktion starten
    return await sails.getDatastore().transaction(async (db) => {
      try {
        if (addressData) {
          await Address.updateOne({ id: existingUser.address.id })
            .set({
              country: addressData.country || existingUser.address.country,
              state: addressData.state || existingUser.address.state,
              city: addressData.city || existingUser.address.city,
              postalCode: addressData.postalCode || existingUser.address.postalCode,
              street: addressData.street || existingUser.address.street,
              houseNumber: addressData.houseNumber || existingUser.address.houseNumber,
              addressAddition: addressData.addressAddition || existingUser.address.addressAddition,
            })
            .usingConnection(db);
        }


        sails.log.error("User.updateOne");
        const updatedUser = await User.updateOne({ id: userId })
          .set({
            emailAddress: emailAddress || existingUser.emailAddress,
            password: hashedPassword,
            firstName: firstName || existingUser.firstName,
            lastName: lastName || existingUser.lastName,
            isAdmin: typeof isAdmin === 'boolean' ? isAdmin : existingUser.isAdmin,

            // address-Feld NICHT neu setzen. Das bleibt verknüpft.
            // => existingUser.address.id bleibt erhalten
          })
          .usingConnection(db);

        // D) finalen User nochmals laden (um die aktualisierte Adresse einzusehen)

        sails.log.error("User.findOne");
        const finalUser = await User.findOne({ id: updatedUser.id })
          .populate('address')
          .populate('payment')
          .usingConnection(db);

        // Passwort entfernen
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

  /**
   * Zaehlt die User
   *
   * @description
   * Zaehlt alle vorhandenen User in der Datenbank und liefert die Anzahl zurueck
   *
   */
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
