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
  findUserById: async function (req) {
    const userId = req.params.id;

    // Benutzer-ID muss vorhanden sein, ansonsten BadRequestError
    if (!userId) {
      throw new errors.BadRequestError('Benutzer-ID ist erforderlich.');
    }

    const user = await User.findOne({ id: userId })
      .populate('orders')
      .populate('address')
      .populate('payments');

    // Wenn kein Benutzer gefunden wurde, NotFoundError werfen
    if (!user) {
      throw new errors.NotFoundError('Benutzer nicht gefunden.');
    }

    // Zahlungen filtern, um nur die relevanten mit `isForOrder: false` einzuschließen
    user.payments = user.payments.filter(payment => payment.isForOrder === false);

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
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Benutzer-ID in req.params.id
   *                        und im Body die zu aktualisierenden Felder (inkl. address & payment).
   * @returns {Object} Das aktualisierte Benutzer-Objekt ohne Passwort.
   * @throws {BadRequestError} Wenn keine Benutzer-ID übergeben wurde.
   * @throws {NotFoundError} Wenn kein Benutzer mit der übergebenen ID existiert.
   * @throws {ConflictError} Wenn die neue E-Mail-Adresse bereits von einem anderen Benutzer verwendet wird.
   */
  updateUser: async function (req) {
    const userId = req.params.id;

    // 1) Prüfen, ob userId überhaupt existiert
    if (!userId) {
      throw new errors.BadRequestError('Benutzer-ID ist erforderlich.');
    }

    // 2) Daten aus dem Request-Body extrahieren
    const {
      emailAddress,
      password,
      firstName,
      lastName,
      isAdmin,
      address,
    } = req.body;

    // 3) Aktuellen Benutzer aus der Session holen
    const currentUserId = req.session.userId;
    const currentUser = await User.findOne({ id: currentUserId });
    if (!currentUser) {
      throw new errors.NotFoundError('Aktueller Benutzer nicht gefunden.');
    }

    // 4) User suchen, der aktualisiert werden soll
    const existingUser = await User.findOne({ id: userId })
      .populate('address') // falls Address-Daten direkt gebraucht
      .populate('payments'); // <== neu: Payment-Daten gleich mitladen

    if (!existingUser) {
      throw new errors.NotFoundError(`Benutzer mit ID ${userId} nicht gefunden.`);
    }

    // 5) Nur Admins dürfen isAdmin auf true setzen
    if (!req.session.user.isAdmin && (isAdmin !== undefined && isAdmin !== false)) {
      throw new errors.ForbiddenError('Nur Admins dürfen die Admin-Flag auf true setzen.');
    }

    // 6) Neues Passwort ggf. hashen
    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = await sails.helpers.passwords.hashPassword(password);
    }

    // 7) Datenbank-Transaktion
    return await sails.getDatastore().transaction(async (db) => {

      //--------------------------------
      // (a) Adresse aktualisieren
      //--------------------------------
      if (address && existingUser.address) {
        await Address.updateOne({ id: existingUser.address.id }) // .id, weil .address selbst das Objekt enthält
          .set({
            country: address.country || existingUser.address.country,
            state: address.state ||  existingUser.address.state,
            city: address.city ||  existingUser.address.city,
            postalCode: address.postalCode ||  existingUser.address.postalCode,
            street: address.street ||  existingUser.address.street,
            houseNumber: address.houseNumber ||  existingUser.address.houseNumber,
            addressAddition: address.addressAddition ||  existingUser.address.addressAddition,
          })
          .usingConnection(db);
      }
      //--------------------------------
      // (b) User aktualisieren
      //--------------------------------
      const updatedUser = await User.updateOne({ id: userId })
        .set({
          emailAddress: emailAddress || existingUser.emailAddress,
          password: hashedPassword,
          firstName: firstName || existingUser.firstName,
          lastName: lastName || existingUser.lastName,
          isAdmin: typeof isAdmin === 'boolean' ? isAdmin : existingUser.isAdmin,

          // Adresse
          address: address.id || existingUser.address.id,
        })
        .usingConnection(db);

      // Passwort aus dem Rückgabeobjekt löschen
      delete updatedUser.password;

      return updatedUser;
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
  async deleteUser(req) {
    const userId = req.params.id;

    // Checken ob die id mitgegeben wurde
    if (!userId) {
      throw new errors.BadRequestError('Benutzer-ID ist erforderlich.');
    }

    // Checken ob der User existiert
    const user = await User.findOne({ id: userId });
    if (!user) {
      return errors.NotFoundError('Der zu loeschende User wurde nicht gefunden!');
    }

    // Order und zugehoerige daten ziehen und loeschen
    const orders = await Order.find({ user: userId });
    for (const order of orders) {
      // Delete related shipping information
      await Shipping.destroy({ order: order.id });

      // Delete related order-product associations
      await OrderProduct.destroy({ order: order.id });

      // Delete the order itself
      await Order.destroy({ id: order.id });
    }

    // Loeschen der angelegten Bezahlmethoden des Users
    await Payment.destroy({ user: userId });

    // Loeschen der angelegten Adresse des Users
    if (user.address) {
      await Address.destroy({ id: user.address });
    }

    // Endlich den User loeschen
    await User.destroy({ id: userId });
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
