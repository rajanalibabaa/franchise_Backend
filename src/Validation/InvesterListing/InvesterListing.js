import Joi from 'joi';

const investorSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).optional(),
  firstName: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().required(),
  mobileNumber: Joi.string()
    .pattern(/^\+91\d{10}$/)
    .required()
    .messages({ 'string.pattern.base': 'Mobile number must be 10 digits' }),
  whatsappNumber: Joi.string()
    .pattern(/^\+91\d{10}$/)
    .optional()
    .allow('')
    .messages({ 'string.pattern.base': 'WhatsApp number must be 10 digits' }),
  address: Joi.string().optional(),
  pincode: Joi.string().optional(),
  country: Joi.string().optional(),
  state: Joi.string().optional(),
  city: Joi.string().optional(),
  occupation: Joi.string()
  .valid("Student", "Salaried Professional", "Bussiness Owner / Self-Employed","Retired","Freelancer/ Consultant","Homemaker","Investor", "Other") // Must match Mongoose enum
  .optional(),
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
propertyType: Joi.string()
  .trim()
  .valid("Own Property", "Rental Property")
  .optional(),

propertySize: Joi.when('propertyType', {
  is: 'Own Property',
  then: Joi.string().required().messages({
    'any.required': 'Property size is required when property type is Own Property'
  }),
  otherwise: Joi.string().optional().allow('').strip()
}),

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

