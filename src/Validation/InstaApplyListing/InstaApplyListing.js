import joi from 'joi';

const instaApplyListingSchema = joi.object({

name: joi.string().min(1).max(100).required(),
email: joi.string().email().required(), 
mobilenumber: joi.string().pattern(/^\+91[6-9][0-9]{9}$/).required().messages({
    'string.pattern.base': 'Mobile number must start with +91 followed by a valid 10-digit Indian mobile number'
}),
state: joi.string().min(2).required(),
city: joi.string().min(2).required(),
pincode: joi.string().pattern(/^[1-9][0-9]{5}$/).required().messages({
    'string.pattern.base': 'Pincode must be a 6-digit number starting from 1-9'
}),
address: joi.string().min(5).required(),
})

// middleware function to validate instaApply data
export const validateInstaApply = (req, res, next) => {
    const { error } = instaApplyListingSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorDetails = error.details.map(detail => detail.message);
        return res.status(400).json({ errors: errorDetails });
    }

    next();
}
