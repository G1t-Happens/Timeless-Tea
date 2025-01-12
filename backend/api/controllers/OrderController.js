module.exports = {
  create: async function (req, res) {
    try {
      const { totalAmount, payment, orderProducts, newShippingAddress } = req.body;
      const user = req.session.userId;

      // Pruefen ob User vorhanden
      if(!user) {
        return res.badRequest({ error: 'Kein User vorhanden' });
      }

      // Validierung der Pflichtfelder
      if (!totalAmount || !user || !payment || !Array.isArray(orderProducts) || orderProducts.length === 0) {
        return res.badRequest({ error: 'Invalid request data. Please provide all required fields.' });
      }

      // Validierung der Produkte und Extraktion der Produkt-IDs
      const productIds = [];
      const invalidProducts = orderProducts.some(op => {
        if (!op.product || !op.quantity || op.quantity <= 0) {
          return true;
        }
        productIds.push(op.product);
        return false;
      });

      if (invalidProducts) {
        return res.badRequest({ error: 'Invalid product data. Each product must have a valid ID and quantity > 0.' });
      }

      // Hole Produkte und prüfe Existenz in einer Abfrage
      const existingProducts = await Product.find({ id: productIds }).select(['id', 'price']);
      if (existingProducts.length !== productIds.length) {
        return res.badRequest({ error: 'One or more products do not exist.' });
      }

      // Berechne den Gesamtbetrag basierend auf den Produkten und Mengen
      const calculatedTotal = orderProducts.reduce((sum, op) => {
        const product = existingProducts.find(p => p.id === op.product);
        return sum + (product.price * op.quantity);
      }, 0);

      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        return res.badRequest({
          error: 'The total amount does not match the sum of the products and quantities.',
          calculatedTotal,
          providedTotal: totalAmount
        });
      }

      // Lade Benutzer- und Zahlungsdaten parallel
      const [orderUser, originalPayment] = await Promise.all([
        User.findOne({ id: user }).populate('address'),
        Payment.findOne({ id: payment, user })
      ]);

      if (!orderUser) {
        return res.badRequest({ error: 'No user found.' });
      }

      if (!originalPayment) {
        return res.badRequest({ error: 'The specified payment method does not exist or does not belong to the user.' });
      }

      const formatDateForDateColumn = (date) => date.toISOString().split('T')[0];
      let createdOrder;

      // Transaktion
      await sails.getDatastore().transaction(async (db) => {
        // Adresse erstellen oder nutzen
        let shippingAddressId;
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
        createdOrder = await Order.create({
          totalAmount: calculatedTotal,
          orderStatus: 'open',
          user,
          payment: null,
          shipping: null
        }).fetch().usingConnection(db);

        // Versanddaten erstellen
        const estimatedDeliveryDate = formatDateForDateColumn(new Date(new Date().setDate(new Date().getDate() + 5)));
        const shippingDate = formatDateForDateColumn(new Date());

        await Shipping.create({
          carrier: 'Default Carrier',
          deliveryStatus: 'not shipped',
          estimatedDeliveryDate: estimatedDeliveryDate,
          shippingDate: shippingDate,
          address: shippingAddressId,
          order: createdOrder.id
        }).fetch().usingConnection(db);

        // Zahlung erstellen
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

        // Bestellung aktualisieren nachdem payment und shipping erstellt wurden
        await Order.updateOne({ id: createdOrder.id }).set({
          payment: orderPayment.id,
          shipping: createdOrder.id
        }).usingConnection(db);

        // Produkte zur Bestellung hinzufügen
        const orderProductRecords = orderProducts.map(op => ({
          order: createdOrder.id,
          product: op.product,
          quantity: op.quantity,
        }));
        await OrderProduct.createEach(orderProductRecords).usingConnection(db);
      });
      // Rückgabe der Bestell-ID mit Status 201
      return res.status(201).json({ id: createdOrder.id });
    } catch (error) {
      sails.log.error('Error creating order:', error);
      return res.serverError({ error: 'An error occurred while creating the order.' });
    }
  },

  find: async function (req, res) {
    try {
      const { page = 1, size = 10, search, productId, userName } = req.query;

      // Pagination
      const limit = parseInt(size);
      const skip = (parseInt(page) - 1) * limit;

      // Query-Filter
      let query = {};

      // Suche nach Status, ID oder Benutzername
      if (search) {
        const numericSearch = !isNaN(search) ? parseInt(search) : null;

        // Benutzer anhand des Namens finden
        const userMatches = await User.find({
          where: {
            or: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
            ],
          },
          select: ['id'],
        });
        const userIds = userMatches.map((user) => user.id);

        query.or = [
          { orderStatus: search }, // Exakter Vergleich für Status
          ...(numericSearch ? [{ id: numericSearch }] : []), // Suche nach numerischer ID
          ...(userIds.length > 0 ? [{ user: { in: userIds } }] : []), // Suche nach Benutzer
        ];
      }

      // Suche nach Produkt-ID
      if (productId) {
        query['orderProducts'] = { some: { product: productId } };
      }

      // Suche nach Benutzername (falls nicht über `search` abgedeckt)
      if (userName) {
        const users = await User.find({
          where: { fullName: { contains: userName } },
          select: ['id'],
        });
        const userIds = users.map((user) => user.id);
        if (userIds.length > 0) {
          query['user'] = { in: userIds };
        }
      }

      // Fetch orders
      const orders = await Order.find(query)
        .sort('createdAt DESC')
        .limit(limit)
        .skip(skip);

      // Fetch associated user data for each order
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const user = await User.findOne({ id: order.user }).select([
            'id',
            'firstName',
            'lastName',
          ]);
          return {
            ...order,
            user, // Benutzerinformationen hinzufügen
          };
        })
      );

      // Total count for pagination
      const totalOrders = await Order.count(query);

      return res.json({
        total: totalOrders,
        orders: enrichedOrders,
      });
    } catch (error) {
      sails.log.error('Error fetching orders:', error);
      return res.serverError({ error: 'An error occurred while fetching orders.' });
    }
  },

  findOne: async function (req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.badRequest({ error: 'Order ID is required.' });
      }

      // Finde die Bestellung ohne Subkriterien in populate
      const order = await Order.findOne({ id })
        .populate('user') // Holen der gesamten User-Daten (ohne Subkriterien)
        .populate('shipping') // Holen der gesamten Versanddaten
        .populate('payment') // Holen der gesamten Zahlungsdaten
        .populate('orderProducts'); // Holen der Bestellprodukte

      if (!order) {
        return res.notFound({ error: 'Order not found.' });
      }

      // Filtere die Felder manuell für `user`, `shipping`, und `payment`
      const filteredUser = order.user
        ? {
          id: order.user.id,
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          emailAddress: order.user.emailAddress,
        }
        : null;

      // Adressdaten aus der `shipping`-Tabelle extrahieren
      let shippingAddress = null;
      if (order.shipping && order.shipping.address) {
        const address = await Address.findOne({ id: order.shipping.address });
        if (address) {
          shippingAddress = {
            country: address.country,
            state: address.state || '',
            city: address.city,
            postalCode: address.postalCode,
            street: address.street,
            houseNumber: address.houseNumber,
            addressAddition: address.addressAddition || '',
          };
        }
      }

      const filteredShipping = order.shipping
        ? {
          carrier: order.shipping.carrier,
          deliveryStatus: order.shipping.deliveryStatus,
          estimatedDeliveryDate: order.shipping.estimatedDeliveryDate,
          shippingDate: order.shipping.shippingDate,
          address: shippingAddress, // Integrierte Adressdaten
        }
        : null;

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

      // Hole die vollständigen Produktinformationen für jedes OrderProduct
      const orderProductsWithDetails = await Promise.all(
        order.orderProducts.map(async (orderProduct) => {
          const product = await Product.findOne({ id: orderProduct.product });
          return {
            ...orderProduct,
            product: product
              ? {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                image: product.image,
              }
              : null,
          };
        })
      );

      // Bereite die vollständigen Daten für die Antwort vor
      const detailedOrder = {
        ...order,
        user: filteredUser,
        shipping: filteredShipping,
        payment: filteredPayment,
        orderProducts: orderProductsWithDetails,
      };

      return res.json(detailedOrder);
    } catch (error) {
      sails.log.error('Error fetching order details:', error);
      return res.serverError({ error: 'An error occurred while fetching order details.' });
    }
  },

  findOrdersByUser: async function (req, res) {
    const userId = req.session.userId;

    try {
      const orders = await Order.find({ user: userId })
        .populate('payment')
        .populate('shipping')
        .populate('orderProducts');

      // Fetch product and address details for each order
      const detailedOrders = await Promise.all(
        orders.map(async (order) => {
          // Populate products in orderProducts
          const populatedOrderProducts = await Promise.all(
            order.orderProducts.map(async (orderProduct) => {
              const product = await Product.findOne({ id: orderProduct.product });
              return {
                ...orderProduct,
                product,
              };
            })
          );

          // Populate address details from shipping
          let shippingAddress = null;
          if (order.shipping && order.shipping.address) {
            shippingAddress = await Address.findOne({ id: order.shipping.address });
          }

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

      return res.ok(detailedOrders);
    } catch (error) {
      sails.log.error('Error fetching orders with details:', error);
      return res.serverError({ error: 'An error occurred while fetching orders.' });
    }
  },

  cancelOrder: async function (req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.session.userId;

      // Check if the order ID is provided
      if (!orderId) {
        return res.badRequest({ error: 'Order ID is required.' });
      }

      // Fetch the order
      const order = await Order.findOne({ id: orderId });

      // Check if the order exists
      if (!order) {
        return res.notFound({ error: 'Order not found.' });
      }

      // Check if my order
      if(order.user !== userId) {
        return res.badRequest({ error: 'NOT MY ORDER' });
      }

      // Check if the order can be canceled (only "open" and "processing" allowed)
      if (!['open', 'processing'].includes(order.orderStatus)) {
        return res.badRequest({
          error: 'Order cannot be canceled. Only orders with status "open" or "processing" can be canceled.',
        });
      }

      // Update the order status to "cancel"
      const updatedOrder = await Order.updateOne({ id: orderId }).set({ orderStatus: 'canceled' });

      // Return the updated order
      return res.ok(updatedOrder);
    } catch (error) {
      sails.log.error('Error canceling order:', error);
      return res.serverError({ error: 'An error occurred while canceling the order.' });
    }
  },

  count: async function (req, res) {
    try {

      // Abrufen aller Bestellungen mit ihren Statuswerten
      const orders = await Order.find({
        select: ['orderStatus']
      });

      // Initialisiere Zähler
      let total = orders.length;
      let finished = 0;
      let active = 0;

      // Kategorien zuordnen
      orders.forEach(order => {
        if (['successful', 'refunded', 'canceled'].includes(order.orderStatus)) {
          finished++;
        } else if (['processing', 'open'].includes(order.orderStatus)) {
          active++;
        }
      });

      return res.json({
        total,
        finished,
        active
      });
    } catch (err) {
      sails.log.error('Error fetching order counts:', err);
      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  }
};
