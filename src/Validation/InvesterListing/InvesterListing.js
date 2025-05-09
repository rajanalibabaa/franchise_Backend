import Joi from 'joi';

const investorSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).optional(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  address: Joi.string().min(5).required(),
  country: Joi.string().min(2).required(),
  pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required().messages({
    'string.pattern.base': 'Pincode must be a 6-digit number starting from 1-9'
  }),
  mobileNumber: Joi.string()
  .pattern(/^\+91[6-9][0-9]{9}$/)
  .required()
  .messages({
    'string.pattern.base': 'Mobile number must start with +91 followed by a valid 10-digit Indian mobile number'
  }),

whatsappNumber: Joi.string()
  .pattern(/^\+91[6-9][0-9]{9}$/)
  .allow('', null)
  .messages({
    'string.pattern.base': 'WhatsApp number must start with +91 followed by a valid 10-digit Indian mobile number'
  }),

  email: Joi.string().email().required(),

  category: Joi.string().valid('Investor', 'Buyer', 'Seller', 'Agent', 'Other').required(),

  investmentRange: Joi.string().min(1).required(), // Adjusted based on model
  // capital: Joi.number().min(0).required(),
  occupation: Joi.string().allow('', null),
  propertytype: Joi.string().required(),
  lookingFor: Joi.string().allow('', null),
  // ownProperty: Joi.string().valid('Yes', 'No').required(),


  // Optional fields
  state: Joi.string().allow('', null),
  district: Joi.string().allow('', null),
  city: Joi.string().allow('', null)
});

// middleware function to validate investor data

export const validateInvestor = (req, res, next) => {
  const { error } = investorSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorDetails = error.details.map(detail => detail.message);
    return res.status(400).json({ errors: errorDetails });
  }

  next();
};

