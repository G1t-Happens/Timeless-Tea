module.exports = {
  create: async function (req, res) {
    try {
      const { totalAmount, orderStatus, user, payment, shipping, orderProducts, newShippingAddress } = req.body;

      // Validierung der Pflichtfelder
      if (!totalAmount || !orderStatus || !user || !payment || !Array.isArray(orderProducts) || orderProducts.length === 0) {
        return res.badRequest({ error: 'Invalid request data. Please provide all required fields.' });
      }

      // Validierung der Produkte
      const invalidProducts = orderProducts.some(op => !op.product || !op.quantity || op.quantity <= 0);
      if (invalidProducts) {
        return res.badRequest({ error: 'Invalid product data. Each product must have a valid ID and quantity > 0.' });
      }

      // Extrahiere nur die Produkt-IDs
      const productIds = orderProducts.map(op => op.product);

      // Prüfe, ob die Produkte existieren und deren Preise
      const existingProducts = await Product.find({ id: productIds });
      if (existingProducts.length !== productIds.length) {
        return res.badRequest({ error: 'One or more products do not exist.' });
      }

      // Berechne den Gesamtbetrag basierend auf den angegebenen Produkten und Mengen
      const calculatedTotal = orderProducts.reduce((sum, op) => {
        const product = existingProducts.find(p => p.id === op.product);
        return sum + (product.price * op.quantity);
      }, 0);

      // Überprüfe, ob der angegebene Gesamtbetrag mit dem berechneten übereinstimmt
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) { // Toleranz für Rundungsfehler
        return res.badRequest({
          error: 'The total amount does not match the sum of the products and quantities.',
          calculatedTotal,
          providedTotal: totalAmount
        });
      }

      // Optionale neue Versandadresse
      let shippingAddressId = null;
      if (newShippingAddress) {
        const newAddress = await Address.create(newShippingAddress).fetch();
        shippingAddressId = newAddress.id;
      }

      // Transaktion
      const newOrder = await sails.getDatastore().transaction(async (db) => {
        // Neues Payment-Objekt für die Order erstellen
        const originalPayment = await Payment.findOne({ id: payment, user });
        if (!originalPayment) {
          throw new Error('The specified payment method does not exist or does not belong to the user.');
        }

        const orderPayment = await Payment.create({
          paymentOption: originalPayment.paymentOption,
          iban: originalPayment.iban,
          creditCardNumber: originalPayment.creditCardNumber,
          expiryDate: originalPayment.expiryDate,
          cvc: originalPayment.cvc,
          paypalEmail: originalPayment.paypalEmail,
          isForOrder: true, // Markiere es als Order-spezifisches Payment
          user,
        }).fetch().usingConnection(db);

        // Bestellung erstellen
        const order = await Order.create({
          totalAmount: calculatedTotal, // Verwende den berechneten Gesamtbetrag
          orderStatus,
          user,
          payment: orderPayment.id, // Verknüpfe mit dem neuen Payment
          shipping: shipping || null,
        }).fetch().usingConnection(db);


        //Order Id auch dem Paymenteintrag mitgeben
        await Payment.updateOne({ id: orderPayment.id }).set({
          order: order.id
        }).usingConnection(db);

        // Produkte zur Bestellung hinzufügen
        const orderProductRecords = orderProducts.map(op => ({
          order: order.id,
          product: op.product,
          quantity: op.quantity,
        }));
        await OrderProduct.createEach(orderProductRecords).usingConnection(db);

        // Versandadresse aktualisieren, falls vorhanden
        if (shippingAddressId) {
          await Shipping.updateOne({ id: shipping }).set({ address: shippingAddressId }).usingConnection(db);
        }

        // Benutzer aktualisieren und Bestellung hinzufügen
        await User.addToCollection(user, 'orders', order.id).usingConnection(db);

        return order;
      });

      return res.ok(newOrder);
    } catch (error) {
      sails.log.error('Error creating order:', error);
      return res.serverError({ error: 'An error occurred while creating the order.' });
    }
  },

  findOrdersByUser: async function (req, res) {

    const userId = req.session.userId;

    try {
      const orders = await Order.find({ user: userId})
        .populate('payment')
        .populate('shipping')
        .populate('orderProducts');

      // Fetch product details for each orderProduct
      const detailedOrders = await Promise.all(
        orders.map(async (order) => {
          const populatedOrderProducts = await Promise.all(
            order.orderProducts.map(async (orderProduct) => {
              const product = await Product.findOne({ id: orderProduct.product });
              return {
                ...orderProduct,
                product,
              };
            })
          );

          return {
            ...order,
            orderProducts: populatedOrderProducts,
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
};
