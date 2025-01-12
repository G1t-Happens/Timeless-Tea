/**
 * LoginController
 *
 * @description :: Server-side actions for handling incoming requests.
 *                 Hier wird nur noch die Request/Response-Logik definiert.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const errors = require('../utils/errors');

module.exports = {
  /**
   * login(req, res)
   *
   * @description
   * Nimmt E-Mail-Adresse und Passwort entgegen, nutzt den Service zum Einloggen
   * und schreibt den User in die Session.
   */
  login: async function (req, res) {
    try {
      const { emailAddress, password } = req.body;
      // Benutzer über den Service einloggen
      const user = await LoginService.loginUser(emailAddress, password, req);
      return res.json(user);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * sessionUser(req, res)
   *
   * @description
   * Gibt den aktuell in der Session gespeicherten User zurück.
   */
  sessionUser: async function (req, res) {
    try {
      const user = LoginService.getSessionUser(req.session);
      return res.json(user);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * register(req, res)
   *
   * @description
   * Legt einen neuen User an, hinterlegt ihn in der Session und gibt ihn zurück.
   */
  register: async function (req, res) {
    try {
      const user = await LoginService.registerUser(req.body, req.session);
      return res.json(user);
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },

  /**
   * logout(req, res)
   *
   * @description
   * Löscht die User-Daten aus der Session und gibt einen OK-Status zurück.
   */
  logout: async function (req, res) {
    try {
      LoginService.logoutUser(req.session);
      return res.ok();
    } catch (err) {
      sails.log.error('Error:', err.message);

      if (err instanceof errors.CustomError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.serverError('An unexpected error occurred.');
    }
  },
};
