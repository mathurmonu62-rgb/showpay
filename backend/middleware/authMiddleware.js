const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized: No token provided', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Unauthorized: Invalid or expired token', 401);
  }
};

const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Unauthorized: No token provided', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return error(res, 'Forbidden: Admin access required', 403);
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return error(res, 'Unauthorized: Invalid or expired token', 401);
  }
};

module.exports = { authMiddleware, adminMiddleware };
