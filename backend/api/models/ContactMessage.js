/**
 * ContactMessage
 *
 * @description :: Das Datenmodell für unseres Kontaktformular
 */

module.exports = {
  attributes: {

    /**
     * @description Name des Senders
     * @type {string}
     * @example Max Mustermann
     */
    name: {
      type: 'string',
      required: true,
      maxLength: 60,
      description: 'Der Name des Absenders',
      example: 'Max Mustermann'
    },

    /**
     * @description Email des Senders
     * @type {string}
     * @example max@beispiel.de
     */
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      maxLength: 100,
      description: 'Die E-Mail-Adresse des Absenders',
      example: 'max@beispiel.de'
    },

    /**
     * @description Betreff
     * @type {string}
     * @example Probleme mit Bestellprozess
     */
    subject: {
      type: 'string',
      required: true,
      maxLength: 50,
      description: 'Der Betreff der Nachricht',
      example: 'Worum geht es?'
    },

    /**
     * @description Nachricht
     * @type {string}
     * @example Ich kann keine Bestellungen aufgeben wegen,...
     */
    message: {
      type: 'string',
      required: true,
      maxLength: 500,
      description: 'Der Inhalt der Nachricht',
      example: 'Schreiben Sie hier Ihre Nachricht...'
    },

    /**
     * @description Zustimmungscheck
     * @type {string}
     * @example true, false
     */
    privacy: {
      type: 'boolean',
      required: true,
      description: 'Zustimmung zu den Datenschutzbestimmungen',
      example: true
    }
  },
};
