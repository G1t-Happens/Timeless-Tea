const errors = require('../utils/errors');

/**
 * OrderService
 *
 * @description :: Server-side functions for handling order-related business logic.
 */
module.exports = {

  /**
   * Erstellt eine neue Bestellung
   *
   * @description
   * Diese Methode verarbeitet die Erstellung einer neuen Bestellung inklusive der Validierung von Benutzerdaten,
   * Produkten und Zahlungsdetails. Alle Operationen erfolgen in einer Transaktion.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält Bestelldaten im Body.
   * @returns {Object} Die ID der erstellten Bestellung.
   * @throws {BadRequestError} Wenn Pflichtfelder fehlen oder ungültige Daten übergeben wurden.
   */
  createOrder: async function (req) {
    // Extrahiere Bestelldaten und Benutzer-ID aus dem Request
    const { totalAmount, payment, orderProducts, newShippingAddress } = req.body;
    const user = req.session.userId;

    // Prüfe, ob ein Benutzer vorhanden ist
    if (!user) {
      throw new errors.BadRequestError('Kein User vorhanden');
    }

    // Validierung der Pflichtfelder
    if (!totalAmount || !payment || !Array.isArray(orderProducts) || orderProducts.length === 0) {
      throw new errors.BadRequestError('Invalid request data. Please provide all required fields.');
    }

    // Validierung der Produkte in der Bestellung
    const productIds = [];
    const invalidProducts = orderProducts.some(op => {
      if (!op.product || !op.quantity || op.quantity <= 0) {
        return true;
      }
      productIds.push(op.product);
      return false;
    });

    if (invalidProducts) {
      throw new errors.BadRequestError('Invalid product data. Each product must have a valid ID and quantity > 0.');
    }

    // Überprüfen, ob die angegebenen Produkte existieren und nicht in der zwischenzeit soft-deleted wurden
    const existingProducts = await Product.find({ id: productIds, isDeleted: false }).select(['id', 'price']);
    if (existingProducts.length !== productIds.length) {
      throw new errors.BadRequestError('One or more products do not exist or are not available anymore.');
    }

    // Berechne den Gesamtbetrag basierend auf den Produktpreisen und Mengen
    const calculatedTotal = orderProducts.reduce((sum, op) => {
      const product = existingProducts.find(p => p.id === op.product);
      return sum + (product.price * op.quantity);
    }, 0);

    // Überprüfe, ob der berechnete Gesamtbetrag mit dem im frontend berechnetem Betrag übereinstimmt
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      throw new errors.BadRequestError('The total amount does not match the sum of the products and quantities.');
    }

    // Lade Benutzer- und Zahlungsinformationen
    const [orderUser, originalPayment] = await Promise.all([
      User.findOne({ id: user }).populate('address'),
      Payment.findOne({ id: payment, user })
    ]);

    if (!orderUser) {
      throw new errors.NotFoundError('No user found.');
    }

    if (!originalPayment) {
      throw new errors.BadRequestError('The specified payment method does not exist or does not belong to the user.');
    }

    // Erstelle die Bestellung innerhalb einer Transaktion (Atomare Operation)
    return await sails.getDatastore().transaction(async (db) => {
      let shippingAddressId;

      // Versandadresse erstellen oder vorhandene Adresse kopieren
      if (newShippingAddress) {
        const newAddress = await Address.create(newShippingAddress).fetch().usingConnection(db);
        shippingAddressId = newAddress.id;
      } else {
        const { address } = orderUser;
        const newAddress = await Address.create({
          country: address.country,
          state: address.state || '',
          city: address.city,
          postalCode: address.postalCode,
          street: address.street,
          houseNumber: address.houseNumber,
          addressAddition: address.addressAddition || ''
        }).fetch().usingConnection(db);
        shippingAddressId = newAddress.id;
      }

      // Bestellung erstellen
      const createdOrder = await Order.create({
        totalAmount: calculatedTotal,
        orderStatus: 'open',
        user,
        payment: null,
        shipping: null
      }).fetch().usingConnection(db);

      // Versanddetails erstellen
      const estimatedDeliveryDate = new Date(new Date().setDate(new Date().getDate() + 7));
      const shippingDate = new Date();
      await Shipping.create({
        carrier: 'Default Carrier',
        deliveryStatus: 'not shipped',
        estimatedDeliveryDate,
        shippingDate,
        address: shippingAddressId,
        order: createdOrder.id
      }).fetch().usingConnection(db);

      // Zahlungsdetails der Bestellung zuordnen
      const orderPayment = await Payment.create({
        paymentOption: originalPayment.paymentOption,
        iban: originalPayment.iban,
        creditCardNumber: originalPayment.creditCardNumber,
        expiryDate: originalPayment.expiryDate,
        cvc: originalPayment.cvc,
        paypalEmail: originalPayment.paypalEmail,
        isForOrder: true,
        user,
        order: createdOrder.id
      }).fetch().usingConnection(db);

      // Bestellung aktualisieren, um Zahlung und Versand zu verknüpfen
      await Order.updateOne({ id: createdOrder.id }).set({
        payment: orderPayment.id,
        shipping: createdOrder.id
      }).usingConnection(db);

      // Bestellprodukte erstellen
      const orderProductRecords = orderProducts.map(op => ({
        order: createdOrder.id,
        product: op.product,
        quantity: op.quantity,
      }));
      await OrderProduct.createEach(orderProductRecords).usingConnection(db);

      // Rückgabe der erstellten Bestell-ID
      return { id: createdOrder.id };
    });
  },

  /**
   * Ruft Bestellungen mit optionalen Filtern ab
   *
   * @description
   * Diese Methode unterstützt die Suche nach Bestellungen basierend auf Suchbegriffen, Benutzername,
   * Produkt-ID oder Pagination.
   *
   * @param {Request} req - Der eingehende HTTP-Request mit Query-Parametern für die Suche.
   * @returns {Object} Eine paginierte Liste der Bestellungen mit zusätzlichen Benutzerinformationen.
   */
  findOrders: async function (req) {
    const { page = 1, size = 10, search, productId, userName } = req.query;

    // Pagination-Parameter
    const limit = parseInt(size);
    const skip = (parseInt(page) - 1) * limit;

    let query = {};

    // Suchkriterien basierend auf einem optionalen Suchbegriff
    if (search) {
      const numericSearch = !isNaN(search) ? parseInt(search) : null;

      // Finde Benutzer mit Namen, die zum Suchbegriff passen
      const userMatches = await User.find({
        where: {
          or: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        },
        select: ['id'],
      });
      const userIds = userMatches.map(user => user.id);

      // Erstelle Suchkriterien
      query.or = [
        { orderStatus: search },
        ...(numericSearch ? [{ id: numericSearch }] : []),
        ...(userIds.length > 0 ? [{ user: { in: userIds } }] : []),
      ];
    }

    // Filter nach Produkt-ID
    if (productId) {
      query['orderProducts'] = { some: { product: productId } };
    }

    // Filter nach Benutzername
    if (userName) {
      const users = await User.find({
        where: { fullName: { contains: userName } },
        select: ['id'],
      });
      const userIds = users.map(user => user.id);
      if (userIds.length > 0) {
        query['user'] = { in: userIds };
      }
    }

    // Finde Bestellungen basierend auf den Kriterien
    const orders = await Order.find(query)
      .sort('createdAt DESC')
      .limit(limit)
      .skip(skip);

    // Bereichere jede Bestellung mit zusätzlichen Benutzerinformationen
    const enrichedOrders = await Promise.all(
      orders.map(async order => {
        const user = await User.findOne({ id: order.user }).select(['id', 'firstName', 'lastName']);
        return { ...order, user };
      })
    );

    // Gesamte Anzahl der Bestellungen
    const totalOrders = await Order.count(query);

    return {
      total: totalOrders,
      orders: enrichedOrders,
    };
  },

  /**
   * Findet eine Bestellung anhand ihrer ID
   *
   * @description
   * Diese Methode lädt eine einzelne Bestellung basierend auf der übergebenen ID aus der Datenbank.
   * Die Bestellung wird zusammen mit ihren zugehörigen Daten (Benutzer, Versand, Zahlung, Produkte)
   * zurückgegeben. Die Daten werden so aufbereitet, dass sensible Informationen herausgefiltert werden.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Bestell-ID in `req.params.id`.
   * @returns {Object} Die vollständigen Bestelldaten einschließlich Benutzer-, Versand-, Zahlungs-
   * und Produktinformationen.
   * @throws {BadRequestError} Wenn keine Bestell-ID übergeben wurde.
   * @throws {NotFoundError} Wenn keine Bestellung mit der angegebenen ID existiert.
   */
  findOrderById: async function (req) {
    // Extrahiere die Bestell-ID aus den Request-Parametern
    const { id } = req.params;

    // Überprüfen, ob die Bestell-ID auch wirklich übergeben wurde
    if (!id) {
      throw new errors.BadRequestError('Order ID is required.');
    }

    // Suche die Bestellung und lade Beziehungen(Benutzer, Versand, Zahlung, Produkte)
    const order = await Order.findOne({ id })
      .populate('user')
      .populate('shipping')
      .populate('payment')
      .populate('orderProducts');

    // Überprüfen, ob die Bestellung existiert
    if (!order) {
      throw new errors.NotFoundError('Order not found.');
    }

    // Filter die Benutzerdaten, um nur relevante Informationen zurückzugeben
    const filteredUser = order.user
      ? { id: order.user.id, firstName: order.user.firstName, lastName: order.user.lastName, emailAddress: order.user.emailAddress }
      : null;

    // Lade die Versandadresse, falls vorhanden
    let shippingAddress = order.shipping?.address
      ? await Address.findOne({ id: order.shipping.address })
      : null;

    // Filter die Versandinformationen
    const filteredShipping = order.shipping
      ? {
        carrier: order.shipping.carrier,
        deliveryStatus: order.shipping.deliveryStatus,
        estimatedDeliveryDate: order.shipping.estimatedDeliveryDate,
        shippingDate: order.shipping.shippingDate,
        address: shippingAddress,
      }
      : null;

    // Filter die Zahlungsinformationen
    const filteredPayment = order.payment
      ? {
        paymentOption: order.payment.paymentOption,
        iban: order.payment.iban,
        paypalEmail: order.payment.paypalEmail,
        creditCardNumber: order.payment.creditCardNumber,
        expiryDate: order.payment.expiryDate,
        cvc: order.payment.cvc,
      }
      : null;

    // Reichere die Produkte mit zusätzlichen Details aus der Datenbank an
    const orderProductsWithDetails = await Promise.all(
      order.orderProducts.map(async orderProduct => {
        const product = await Product.findOne({ id: orderProduct.product });
        return {
          ...orderProduct,
          product,
        };
      })
    );

    // Rückgabe der vollständigen Bestelldaten
    return {
      ...order,
      user: filteredUser,
      shipping: filteredShipping,
      payment: filteredPayment,
      orderProducts: orderProductsWithDetails,
    };
  },

  /**
   * Ruft alle Bestellungen eines Benutzers ab
   *
   * @description
   * Diese Methode lädt alle Bestellungen eines authentifizierten Benutzers aus der Datenbank.
   * Jede Bestellung wird mit ihren zugehörigen Daten (Produkte, Versand und Zahlung) angereichert
   * und zurückgegeben.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Benutzer-ID in der Session (`req.session.userId`).
   * @returns {Array<Object>} Eine Liste aller Bestellungen des Benutzers mit vollständigen Details.
   * @throws {BadRequestError} Wenn kein Benutzer authentifiziert ist.
   */
  findOrdersByUser: async function (req) {
    // Extrahiere die Benutzer-ID aus der Session
    const userId = req.session.userId;

    // Überprüfen, ob der Benutzer authentifiziert/vorhanden ist
    if (!userId) {
      throw new errors.BadRequestError('User not authenticated.');
    }

    // Suche alle Bestellungen des Benutzers und lade zugehörige Daten (Zahlung, Versand, Produkte)
    const orders = await Order.find({ user: userId })
      .populate('payment')
      .populate('shipping')
      .populate('orderProducts');

    // Reichere jede Bestellung mit detaillierten Produkt- und Versandinformationen an
    return await Promise.all(
      orders.map(async order => {
        // Lade Details für jedes Produkt in der Bestellung
        const populatedOrderProducts = await Promise.all(
          order.orderProducts.map(async orderProduct => {
            const product = await Product.findOne({ id: orderProduct.product });
            return { ...orderProduct, product };
          })
        );

        // Lade die Versandadresse
        let shippingAddress = order.shipping?.address ? await Address.findOne({ id: order.shipping.address }) : null;

        // Rückgabe der angereicherten Bestelldaten
        return {
          ...order,
          orderProducts: populatedOrderProducts,
          shipping: {
            ...order.shipping,
            address: shippingAddress,
          },
        };
      })
    );
  },

  /**
   * Storniert eine Bestellung
   *
   * @description
   * Diese Methode erlaubt es einem Benutzer, eine eigene Bestellung zu stornieren, solange sie sich
   * im Status "open" oder "processing" befindet. Die Bestellung wird auf den Status "canceled" gesetzt.
   *
   * @param {Request} req - Der eingehende HTTP-Request, enthält die Bestell-ID in `req.params.id`
   *                        und die Benutzer-ID in der Session (`req.session.userId`).
   * @returns {Object} Die aktualisierte Bestellung mit dem neuen Status.
   * @throws {BadRequestError} Wenn keine Bestell-ID angegeben wurde oder die Bestellung nicht storniert werden kann.
   * @throws {NotFoundError} Wenn die Bestellung nicht existiert.
   */
  cancelOrder: async function (req) {
    // Extrahiere die Bestell-ID aus den Request-Parametern und die Benutzer-ID aus der Session
    const { id } = req.params;
    const userId = req.session.userId;

    // Überprüfen, ob eine Bestell-ID übergeben wurde
    if (!id) {
      throw new errors.BadRequestError('Order ID is required.');
    }

    // Suche die Bestellung in der Datenbank
    const order = await Order.findOne({ id });

    // Überprüfen, ob die Bestellung existiert
    if (!order) {
      throw new errors.NotFoundError('Order not found.');
    }

    // Überprüfen, ob die Bestellung dem authentifizierten session User gehört
    if (order.user !== userId) {
      throw new errors.BadRequestError('You can only cancel your own orders.');
    }

    // Überprüfen, ob die Bestellung storniert werden kann (nur "open" oder "processing")
    if (!['open', 'processing'].includes(order.orderStatus)) {
      throw new errors.BadRequestError('Order cannot be canceled. Only "open" or "processing" orders can be canceled.');
    }

    // Aktualisiere den Bestellstatus auf "canceled"
    return await Order.updateOne({ id }).set({ orderStatus: 'canceled' });
  },

  /**
   * Zählt alle Bestellungen und kategorisiert sie nach ihrem Status(Metadaten fuers Admindashboard)
   *
   * @description
   * Diese Methode berechnet die Gesamtanzahl der Bestellungen in der Datenbank und teilt sie in
   * abgeschlossene und aktive Bestellungen ein. Abgeschlossene Bestellungen umfassen die Status
   * "successful", "refunded" und "canceled", während aktive Bestellungen die Status "processing" und "open" haben.
   *
   * @returns {Object} Ein Objekt mit der Gesamtanzahl aller Bestellungen sowie der Anzahl von
   *                   abgeschlossenen und aktiven Bestellungen.
   */
  countOrders: async function () {
    // Abrufen aller Bestellungen mit ihrem Status aus der Datenbank
    const orders = await Order.find({ select: ['orderStatus'] });

    // Initialisieren der Zählvariablen
    let total = orders.length;
    let finished = 0;
    let active = 0;

    // Durchlaufen aller Bestellungen und Kategorisieren nach Status
    orders.forEach(order => {
      if (['successful', 'refunded', 'canceled'].includes(order.orderStatus)) {
        finished++;
      } else if (['processing', 'open'].includes(order.orderStatus)) {
        active++;
      }
    });

    // Rückgabe des Ergebnisses
    return { total, finished, active };
  },


  /**
   * Aktualisiert den Status einer Bestellung.
   *
   * @description
   * Diese Methode aktualisiert den Status einer Bestellung anhand der übergebenen Bestell-ID (`id`)
   * und des neuen Bestellstatus (`orderStatus`). Sie prüft zunächst, ob die erforderlichen Parameter
   * vorhanden sind, validiert die Bestellung und aktualisiert anschließend den Status.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   *                        Enthält die Bestell-ID in `req.params.id` und den neuen Status in `req.body.orderStatus`.
   *
   * @throws {BadRequestError} Wenn keine Bestell-ID oder kein Bestellstatus angegeben ist.
   * @throws {NotFoundError} Wenn keine Bestellung mit der angegebenen ID gefunden wird.
   *
   * @returns {Object} Die aktualisierte Bestellung mit dem neuen Status.
   */
  updateOrderStatus: async function (req) {
    const { orderStatus } = req.body;
    const { id } = req.params;

    // Überprüfen, ob eine Bestell-ID übergeben wurde
    if (!id) {
      throw new errors.BadRequestError('Order ID is required.');
    }

    // Überprüfen, ob ein neuer OrderStatus übergeben wurde
    if (!orderStatus) {
      throw new errors.BadRequestError('OrderStatus is required.');
    }

    // Suche die Bestellung in der Datenbank
    const order = await Order.findOne({ id });

    // Überprüfen, ob eine Bestell gefunden wurde, ansonsten 404
    if (!order) {
      throw new errors.NotFoundError('Order not found.');
    }

    //OrderStatus updaten
    return await Order.updateOne({ id }).set({
      orderStatus: orderStatus,
    });

  },

  /**
   * Aktualisiert die Versandinformationen einer Bestellung.
   *
   * @description
   * Diese Methode aktualisiert die Versanddetails einer Bestellung, einschließlich des Versandunternehmens
   * (`carrier`), des Lieferstatus (`deliveryStatus`), des geschätzten Lieferdatums (`estimatedDeliveryDate`)
   * und des Versanddatums (`shippingDate`). Falls ein Feld nicht im Request-Body angegeben ist, wird der
   * bestehende Wert beibehalten.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   *                        Enthält die Bestell-ID in `req.params.id` und die neuen Versandinformationen
   *                        im Request-Body.
   *
   * @throws {BadRequestError} Wenn keine Bestell-ID angegeben ist.
   * @throws {NotFoundError} Wenn keine Bestellung mit der angegebenen ID gefunden wird.
   *
   * @returns {Object} Die aktualisierten Versandinformationen.
   */
  updateOrderShipping: async function (req) {
    const { carrier, deliveryStatus, estimatedDeliveryDate, shippingDate } = req.body;
    const { id } = req.params;

    // Überprüfen, ob eine Bestell-ID übergeben wurde
    if (!id) {
      throw new errors.BadRequestError('Order ID is required.');
    }

    // Suche die Bestellung in der Datenbank
    const order = await Order.findOne({ id });

    // Überprüfen, ob eine Bestell gefunden wurde, ansonsten 404
    if (!order) {
      throw new errors.NotFoundError('Order not found.');
    }

    //Shippinginformationen updaten
    return await Shipping.updateOne({ id: order.shipping }).set({
      carrier: carrier || order.carrier,
      deliveryStatus: deliveryStatus || order.deliveryStatus,
      estimatedDeliveryDate: estimatedDeliveryDate || order.estimatedDeliveryDate,
      shippingDate: shippingDate || order.shipping,
    });
  },

  /**
   * Aktualisiert die Versandaddresse einer Bestellung.
   *
   * @description
   * Diese Methode aktualisiert die Lieferadresse einer Bestellung basierend auf der Bestell-ID (`id`)
   * und den neuen Adressdaten, die im Request-Body übergeben werden. Felder, die nicht im Request-Body
   * enthalten sind, behalten ihre bestehenden Werte.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   *                        Enthält die Bestell-ID in `req.params.id` und die neuen Adressinformationen
   *                        im Request-Body.
   *
   * @throws {BadRequestError} Wenn keine Bestell-ID angegeben ist.
   * @throws {NotFoundError} Wenn die Bestellung oder die zugehörige Lieferadresse nicht gefunden wird.
   *
   * @returns {Object} Die aktualisierte Lieferadresse.
   */
  updateOrderDeliveryAddress: async function (req) {
    const { country, state, city, postalCode, street, houseNumber, addressAddition } = req.body;
    const { id } = req.params;

    // Überprüfen, ob eine Bestell-ID übergeben wurde
    if (!id) {
      throw new errors.BadRequestError('Order ID is required.');
    }

    // Suche die Bestellung in der Datenbank
    const order = await Order.findOne({ id }).populate('shipping');

    // Überprüfen, ob eine Bestellung gefunden wurde, ansonsten 404
    if (!order?.shipping?.address) {
      throw new errors.NotFoundError('Order or shipping address not found.');
    }

    // Shippinginformationen updaten
    return await Address.updateOne({ id: order.shipping.address }).set({
      country: country || order.shipping.address.country,
      state: state || order.shipping.address.state,
      city: city || order.shipping.address.city,
      postalCode: postalCode || order.shipping.address.postalCode,
      street: street || order.shipping.address.street,
      houseNumber: houseNumber || order.shipping.address.houseNumber,
      addressAddition: addressAddition || order.shipping.address.addressAddition,
    });
  },

  /**
   * Aktualisiert die Zahlungsinformationen einer Bestellung.
   *
   * @description
   * Diese Methode aktualisiert die Zahlungsinformationen einer Bestellung basierend auf der Bestell-ID (`id`)
   * und den im Request-Body übergebenen Zahlungsdetails. Sie validiert die angegebene Zahlungsoption und
   * überschreibt nur die relevanten Felder, abhängig von der gewählten Zahlungsart.
   *
   * @param {Request} req - Der eingehende HTTP-Request.
   *                        Enthält die Bestell-ID in `req.params.id` und die neuen Zahlungsdetails
   *                        im Request-Body.
   *
   * @throws {BadRequestError} Wenn keine Bestell-ID oder keine gültige Zahlungsoption angegeben ist.
   * @throws {NotFoundError} Wenn keine Bestellung mit der angegebenen ID gefunden wird.
   * @throws {ConflictError} Wenn die Aktualisierung der Zahlungsinformationen fehlschlägt.
   *
   * @returns {Object} Die aktualisierten Zahlungsinformationen.
   */
  updateOrderPayment: async function (req) {
    const { paymentOption, creditCardNumber, expiryDate, paypalEmail, iban } = req.body;
    const { id } = req.params;

    // Überprüfen, ob eine Bestell-ID übergeben wurde
    if (!id) {
      throw new errors.BadRequestError('Order ID is required.');
    }

    // Suche die Bestellung in der Datenbank
    const order = await Order.findOne({ id });

    // Überprüfen, ob die Bestellung gefunden wurde, ansonsten 404
    if (!order) {
      throw new errors.NotFoundError('Order not found.');
    }

    // Überprüfen, ob die Zahlungsoption gültig ist
    if (!['credit card', 'paypal', 'bank transfer'].includes(paymentOption)) {
      throw new errors.BadRequestError('Invalid payment option provided.');
    }

    // Aufbau der neuen Zahlungsdaten basierend auf der Zahlungsoption
    const updatedPaymentInfo = {
      paymentOption,
      creditCardNumber: paymentOption === 'credit card' ? creditCardNumber : null,
      expiryDate: paymentOption === 'credit card' && expiryDate ? new Date(expiryDate).toISOString() : null,
      paypalEmail: paymentOption === 'paypal' ? paypalEmail : null,
      iban: paymentOption === 'bank transfer' ? iban : null,
    };

    // Update der Zahlungsinformationen in der Datenbank
    const updatedPayment = await Payment.updateOne({ id: order.payment }).set(updatedPaymentInfo);

    if (!updatedPayment) {
      throw new errors.ConflictError('Failed to update payment information.');
    }

    return updatedPayment;
  },

};
