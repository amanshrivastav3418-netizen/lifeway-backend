const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

// Compare password
const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Verify JWT token
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyJWT,
};
