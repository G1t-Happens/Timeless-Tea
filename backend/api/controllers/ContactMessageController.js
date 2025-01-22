// api/controllers/ContactMessageController.js

const errors = require('../utils/errors');
module.exports = {

  // Daten speichern
  create: async function (req, res) {
    const { name, email, subject, message, privacy } = req.body;
    try {
      // Service aufrufen und Message erstellen
      const newMessage = await ContactMessageService.createMessage({
        name,
        email,
        subject,
        message,
        privacy,
      });

      return res.status(201).json({ data: newMessage });

    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },

  // Alle Daten ausgeben
  find: async function (req, res) {
    try {
      // Service aufrufen und alle Nachrichten finden
      const messages = await ContactMessageService.findMessage();
      return res.status(200).json({ data: messages });

    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },

  // Einzelnes Formular nach ID abrufen
  findOne: async function (req, res) {
    const { id } = req.params;
    try {
      // Service aufrufen und eine Nachrichten anhand der id finden
      const message = await ContactMessageService.findOneMessage({ id });
      return res.status(200).json({ data: message });

    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },

  // Nachricht löschen
  destroy: async function (req, res) {
    const { id } = req.params;
    try {
      // Service aufrufen und eine Nachrichten anhand der id loeschen
      await ContactMessageService.destroyOneMessage({ id });
      return res.ok();

    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  }
};
