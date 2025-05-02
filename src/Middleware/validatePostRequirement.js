import { postRequirementSchema } from '../Validation/PostRequirementListing/PostRequirementListing.js';

export const validatePostRequirement = (req, res, next) => {
  const { error } = postRequirementSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
