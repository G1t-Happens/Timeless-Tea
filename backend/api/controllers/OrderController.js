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
            state: address.state || null,
            city: address.city,
            postalCode: address.postalCode,
            street: address.street,
            houseNumber: address.houseNumber,
            addressAddition: address.addressAddition || null
          }).fetch().usingConnection(db);
          shippingAddressId = newAddress.id;
        }

        // Bestellung erstellen
        const order = await Order.create({
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
          order: order.id
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
          order: order.id
        }).fetch().usingConnection(db);

        // Bestellung aktualisieren nachdem payment und shipping erstellt wurden
        await Order.updateOne({ id: order.id }).set({
          payment: orderPayment.id,
          shipping: order.id
        }).usingConnection(db);

        // Produkte zur Bestellung hinzufügen
        const orderProductRecords = orderProducts.map(op => ({
          order: order.id,
          product: op.product,
          quantity: op.quantity,
        }));
        await OrderProduct.createEach(orderProductRecords).usingConnection(db);
      });
      return res.sendStatus(201);
    } catch (error) {
      sails.log.error('Error creating order:', error);
      return res.serverError({ error: 'An error occurred while creating the order.' });
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
};
