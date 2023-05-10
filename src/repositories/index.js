const { findBuyRequestData, createDeal } = require('./deals/dealsRepositories');
const {
  createProduct,
  findProductById,
} = require('./products/productsRepositories');
const {
  findUserByEmail,
  findUserByUsername,
  createUser,
  findUserByActivationCode,
  addUserVerificationDate,
} = require('./users/usersRepositories');

module.exports = {
  findUserByEmail,
  findUserByUsername,
  createUser,
  findUserByActivationCode,
  addUserVerificationDate,
  findBuyRequestData,
  createDeal,
  createProduct,
  findProductById,
};
