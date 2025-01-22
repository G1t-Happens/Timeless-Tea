/**
 * api/services/ContactMessageService.js
 *
 * @description :: Service zum Verwalten von Kontaktformular Nachrichten.
 *                 Hier werden Zugriffe auf die Datenbank oder andere Business-Logik gekapselt.
 */

const errors = require('../utils/errors');
module.exports = {

  createMessage: async function ({ name, email, subject, message, privacy }) {

    if (!name) {
      throw new errors.BadRequestError('Name is required.');
    }

    if (!email) {
      throw new errors.BadRequestError('Email is required.');
    }

    if (!subject) {
      throw new errors.BadRequestError('Subject is required.');
    }

    if (!message) {
      throw new errors.BadRequestError('Message is required.');
    }

    if (!privacy) {
      throw new errors.BadRequestError('Privacy agreement is required.');
    }

    return await ContactMessage.create({
      name,
      email,
      subject,
      message,
      privacy,
    }).fetch();
  },

  findMessage: async function () {
    return await ContactMessage.find();
  },

  findOneMessage: async function ({ id }) {
    const message = await ContactMessage.findOne({ id });
    if(!message) {
      throw new errors.NotFoundError('Message not found.');
    }
    return message;
  },

  destroyOneMessage: async function ({ id }) {
    const message = await ContactMessage.destroyOne({ id });
    if(!message) {
      throw new errors.NotFoundError('Message not found.');
    }
  },

};
