const jwt = require('jsonwebtoken');
const throwError = require('./errors/throwError');

const validateAuth = async (req, res, next) => {
  try {
    let { authorization } = req.headers;
    const [bearer, userToken] = authorization.split(' ');

    if (!userToken || bearer !== 'Bearer') {
      throwError(400, 'Petición incompleta');
    }
    const { SECRET } = process.env;
    try {
      const token = jwt.verify(userToken, SECRET);
    } catch {
      throwError(400, 'Autorización no válida');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validateAuth;
