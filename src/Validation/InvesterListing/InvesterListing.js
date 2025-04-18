const Joi = require('joi');

const schema = Joi.object({
  firstname: Joi.string().min(1).max(100).required(),
  lastname: Joi.string().min(1).max(100).required(),
  address: Joi.string().min(5).required(),
  country: Joi.string().min(2).required(),
  pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required().messages({
    'string.pattern.base': 'Pincode must be a 6-digit number starting from 1-9'
  }),
  mobileNumber: Joi.string().pattern(/^[6-9][0-9]{9}$/).required().messages({
    'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number'
  }),
  whatsappNumber: Joi.string().pattern(/^[6-9][0-9]{9}$/).required().messages({
    'string.pattern.base': 'WhatsApp number must be a valid 10-digit Indian mobile number'
  }),
  email: Joi.string().email().required(),

  category: Joi.string().valid('Investor', 'Buyer', 'Seller', 'Agent', 'Other').required(),

  investmentRange: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().greater(Joi.ref('min')).required()
  }).required(),

  capital: Joi.number().min(0).required(),
  occupation: Joi.string().required(),

  propertyType: Joi.string().valid('Residential', 'Commercial', 'Industrial', 'Agricultural').required(),

  lookingFor: Joi.string().min(1).required(),
  ownProperty: Joi.boolean().required()
});
