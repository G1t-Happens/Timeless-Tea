/**
 * errors.js - Custom Error Class für die Anwendung
 *
 * @description
 * Diese Klassen erweitern die native JavaScript Error-Klasse, um eigene
 * Statuscodes und Fehlermeldungen definieren zu können. Sie dienen als Grundlage
 * für spezifische Fehlerklassen wie BadRequestError, NotFoundError und UnauthorizedError.
 */

class CustomError extends Error {
  /**
   * Erstellt eine neue CustomError-Instanz.
   *
   * @param {string} message - Die Fehlermeldung, die angezeigt werden soll.
   * @param {number} status - Der HTTP-Statuscode, der mit dem Fehler verknüpft ist.
   */
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status || 500; // Standardmäßig HTTP-Status 500 (Internal Server Error)
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends CustomError {
  /**
   * Erstellt einen BadRequestError (HTTP-Status 400).
   *
   * @param {string} message - Die Fehlermeldung (Standard: 'Bad Request').
   */
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class NotFoundError extends CustomError {
  /**
   * Erstellt einen NotFoundError (HTTP-Status 404).
   *
   * @param {string} message - Die Fehlermeldung (Standard: 'Not Found').
   */
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

class UnauthorizedError extends CustomError {
  /**
   * Erstellt einen UnauthorizedError (HTTP-Status 401).
   *
   * @param {string} message - Die Fehlermeldung (Standard: 'Unauthorized').
   */
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

module.exports = {
  CustomError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError
};
