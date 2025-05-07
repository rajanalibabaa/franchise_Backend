import joi from 'joi';
const feedbackListingSchema = joi.object({
    topic: joi.string().min(1).max(100).required(),
    feedback: joi.string().min(1).max(1000).required(),
    rating: joi.number().min(1).max(5).required(),
    date: joi.date().default(Date.now)
});

// middleware function to validate feedback data
export const validateFeedback = (req, res, next) => {
    const { error } = feedbackListingSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorDetails = error.details.map(detail => detail.message);
        return res.status(400).json({ errors: errorDetails });
    }
    next();
};