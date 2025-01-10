module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      description: 'Der Name des Absenders',
      example: 'Max Mustermann'
    },

    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'Die E-Mail-Adresse des Absenders',
      example: 'max@beispiel.de'
    },

    subject: {
      type: 'string',
      required: true,
      description: 'Der Betreff der Nachricht',
      example: 'Worum geht es?'
    },

    message: {
      type: 'string',
      required: true,
      description: 'Der Inhalt der Nachricht',
      example: 'Schreiben Sie hier Ihre Nachricht...'
    },

    privacy: {
      type: 'boolean',
      required: true,
      description: 'Zustimmung zu den Datenschutzbestimmungen',
      example: true
    }
  },
};
