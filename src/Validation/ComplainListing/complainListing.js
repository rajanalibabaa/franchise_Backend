import joi from 'joi';
const complainListingSchema = joi.object({
    topic: joi.string().min(1).max(100).required(),
    complain: joi.string().min(1).max(1000).required(),
    date: joi.date().default(Date.now),
});

// middleware function to validate feedback data
export const validateComplain = (req, res, next) => {
    const { error } = complainListingSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorDetails = error.details.map(detail => detail.message);
        return res.status(400).json({ errors: errorDetails });
    }
    next();
};