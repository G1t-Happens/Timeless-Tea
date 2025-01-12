module.exports = {

  /**
   * Erstellen einer neuen Zahlungsmethode für einen Benutzer und Verknüpfen
   */
  create: async function(req, res) {
    try {
      // Die übergebenen Daten aus dem Request-Body
      const { paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail, userId } = req.body

      // Validierung der erforderlichen Felder
      if (!paymentOption || !userId) {
        return res.badRequest({ error: 'Payment option and user ID are required.' })
      }

      // Optional: Validierung der Zahlungsmethoden-spezifischen Felder
      if (paymentOption === 'bank transfer' && !iban) {
        return res.badRequest({ error: 'IBAN is required for bank transfers.' })
      }
      if (paymentOption === 'credit card' && (!creditCardNumber || !expiryDate || !cvc)) {
        return res.badRequest({ error: 'Credit card details (number, expiry date, and CVC) are required.' })
      }
      if (paymentOption === 'paypal' && !paypalEmail) {
        return res.badRequest({ error: 'PayPal email is required for PayPal payments.' })
      }

      // Erstelle das Payment-Objekt
      const newPayment = await Payment.create({
        paymentOption,
        iban: paymentOption === 'bank transfer' ? iban : null,
        creditCardNumber: paymentOption === 'credit card' ? creditCardNumber : null,
        expiryDate: paymentOption === 'credit card' ? expiryDate : null,
        cvc: paymentOption === 'credit card' ? cvc : null,
        paypalEmail: paymentOption === 'paypal' ? paypalEmail : null,
        isForOrder: false,
        user: userId
      }).fetch()

      // Optional: Aktualisiere die aktuelle Zahlungsmethode des Benutzers
      // Wenn du sicherstellen möchtest, dass immer die aktuelle Zahlungsmethode genutzt wird
      await User.addToCollection(userId, 'payments', newPayment.id)
      return res.ok(newPayment)

    } catch (error) {
      sails.log.error('Error creating payment:', error)
      return res.serverError({ error: 'An error occurred while creating the payment.' })
    }
  },

  /**
   * Alle Zahlungsmethoden für einen Benutzer anzeigen
   */
  findPaymentsByUser: async function(req, res) {
    try {
      const userId = req.params.userId

      // Finde alle Zahlungen, die mit diesem Benutzer verknüpft sind
      const payments = await Payment.find({ user: userId })

      if (!payments || payments.length === 0) {
        return res.notFound({ error: 'No payments found for this user.' })
      }

      return res.ok(payments)

    } catch (error) {
      sails.log.error('Error fetching payments for user:', error)
      return res.serverError({ error: 'An error occurred while fetching payments.' })
    }
  },

  /**
   * Aktualisieren einer Zahlungsmethode (falls notwendig)
   */
  updatePayment: async function(req, res) {
    try {
      const { paymentId } = req.params
      const userId = req.session.userId
      const { paymentOption, iban, creditCardNumber, expiryDate, cvc, paypalEmail } = req.body

      // Finde das Payment mit der ID
      const payment = await Payment.findOne({ id: paymentId })

      if (!payment) {
        return res.notFound({ error: 'Payment not found.' })
      }

      if (payment.id !== userId) {
        return res.notFound({ error: 'Not my payment.' })
      }

      // Aktualisiere die Zahlungsmethoden-spezifischen Felder, je nach `paymentOption`
      const updatedPayment = await Payment.updateOne({ id: paymentId }).set({
        paymentOption,
        iban: paymentOption === 'bank transfer' ? iban : payment.iban,
        creditCardNumber: paymentOption === 'credit card' ? creditCardNumber : payment.creditCardNumber,
        expiryDate: paymentOption === 'credit card' ? expiryDate : payment.expiryDate,
        cvc: paymentOption === 'credit card' ? cvc : payment.cvc,
        paypalEmail: paymentOption === 'paypal' ? paypalEmail : payment.paypalEmail
      })

      return res.ok(updatedPayment)

    } catch (error) {
      sails.log.error('Error updating payment:', error)
      return res.serverError({ error: 'An error occurred while updating the payment.' })
    }
  },


  destroy: async function(req, res) {
    const { id } = req.params // Payment ID aus der URL
    const userId = req.session.userId // Die ID des angemeldeten Users aus der Session

    sails.log.error('1')
    // 1. Finde das Payment-Objekt
    const payment = await Payment.findOne({ id })

    sails.log.error(payment)

    //TODO: Eigener User darf und Admin darf updaten ansonsten fehler
    // Nicht meine Bezahlmethode, deswegen das ich diese nicht bearbeiten
    // if(payment.user !== userId || !req.session.user.isAdmin) {
    //   return res.status(401);
    // }

    sails.log.error('2')

    await Payment.destroy({ id })
    sails.log.error('3')
    return res.ok()
  }

}
