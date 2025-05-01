// import {investorSchema} from '../Models/investorModel.js'; // import the investor schema


// // middleware function to validate investor data

// export const validateInvestor = (req, res, next) => {
//   const { error } = investorSchema.validate(req.body, { abortEarly: false });

//   if (error) {
//     const errorDetails = error.details.map(detail => detail.message);
//     return res.status(400).json({ errors: errorDetails });
//   }

//   next();
// }