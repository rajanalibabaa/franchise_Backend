 import Joi from 'joi';

export const postRequirementSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  address: Joi.string().min(5).required(),
  country: Joi.string().min(2).required(),
  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      'string.pattern.base': 'Pincode must be a 6-digit number starting from 1-9'
    }),
  city: Joi.string().required(),
  state: Joi.string().required(),
  mobileNumber: Joi.string()
    .pattern(/^[6-9][0-9]{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number'
    }),
  whatsappNumber: Joi.string()
    .pattern(/^[6-9][0-9]{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'WhatsApp number must be a valid 10-digit Indian mobile number'
    }),
  email: Joi.string().email().required(),
  industryType: Joi.string().min(2).max(100).required(),
  investmentRange: Joi.object({
    min: Joi.number().required(),
    max: Joi.number().required()
  }).required(),
  floorAreaRequirement: Joi.string()
    .optional()
    .allow('')
    .max(100)
    .messages({
      'string.max': 'Floor area description is too long'
    }),
  timelineToStart: Joi.string().min(2).max(100).required(),
  needLoan: Joi.string().min(2).max(100).required()
});


// Middleware to validate the request body for posting a requirement


export const validatePostRequirement = (req, res, next) => {
  const { error } = postRequirementSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};



