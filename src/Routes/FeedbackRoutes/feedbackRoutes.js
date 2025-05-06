import { Router } from 'express';
import { createFeedback } from '../../controller/FeedbackController/feedbackController.js';

import {validateFeedback } from '../../Validation/feedbackListing/feedbackListing.js'; // Ensure the correct path

const router = Router();

router.post('/createFeedback', validateFeedback ,createFeedback);

export default router;
