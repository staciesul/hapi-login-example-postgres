var Joi = require('joi');
module.exports = {
  email    : Joi.string().email().required(), // Required
  password : Joi.string().required().min(6),  // minimum length 6 characters]
  id       : Joi.any().forbidden()
};
