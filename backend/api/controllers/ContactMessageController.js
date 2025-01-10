// api/controllers/ContactMessageController.js

module.exports = {

  // Daten speichern
  create: async function (req, res) {
    try {
      const { name, email, subject, message, privacy } = req.body;

      // Daten validieren und speichern
      const newMessage = await ContactMessage.create({
        name,
        email,
        subject,
        message,
        privacy
      }).fetch();

      return res.status(201).json({
        message: 'Nachricht erfolgreich gespeichert.',
        data: newMessage
      });

    } catch (error) {
      return res.status(400).json({
        message: 'Fehler beim Speichern der Nachricht.',
        error: error.message
      });
    }
  },

  // Alle Daten ausgeben
  find: async function (req, res) {
    try {
      const messages = await ContactMessage.find();
      return res.status(200).json({
        message: 'Nachrichten erfolgreich abgerufen.',
        data: messages
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Fehler beim Abrufen der Nachrichten.',
        error: error.message
      });
    }
  },

  // Einzelnes Formular nach ID abrufen
  findOne: async function (req, res) {
    try {
      const { id } = req.params;

      const message = await ContactMessage.findOne({ id });

      if (!message) {
        return res.status(404).json({
          message: 'Nachricht nicht gefunden.'
        });
      }

      return res.status(200).json({
        message: 'Nachricht erfolgreich abgerufen.',
        data: message
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Fehler beim Abrufen der Nachricht.',
        error: error.message
      });
    }
  },

  // Nachricht löschen
  destroy: async function (req, res) {
    try {
      const { id } = req.params;

      const deletedMessage = await ContactMessage.destroyOne({ id });

      if (!deletedMessage) {
        return res.status(404).json({
          message: 'Nachricht nicht gefunden.'
        });
      }

      return res.status(200).json({
        message: 'Nachricht erfolgreich gelöscht.'
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Fehler beim Löschen der Nachricht.',
        error: error.message
      });
    }
  }

};
