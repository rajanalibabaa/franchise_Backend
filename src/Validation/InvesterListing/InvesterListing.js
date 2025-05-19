import Joi from 'joi';

const investorSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).optional(),
  firstName: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().required(),
  mobileNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({ 'string.pattern.base': 'Mobile number must be 10 digits' }),
  whatsappNumber: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .allow('')
    .messages({ 'string.pattern.base': 'WhatsApp number must be 10 digits' }),
  address: Joi.string().required(),
  pincode: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  occupation: Joi.string()
  .valid("Business", "Professional", "Retired", "Student", "Other") // Must match Mongoose enum
  .required(),
specifyOccupation: Joi.when('occupation', {
  is: 'Other',
  then: Joi.string().trim().min(2).max(50).required(),
  otherwise: Joi.string().optional().allow('').strip() // Remove if not "Other"
}),
  category: Joi.string()
    .valid(' ') // <-- fill this in your Mongoose too!
    .required(),
  investmentRange: Joi.string().required(),
  investmentAmount: Joi.string().required(),
  propertyType: Joi.string().required(),
  propertySize: Joi.string().required(),
  preferredState: Joi.string().required(),
  preferredCity: Joi.string().required()
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

