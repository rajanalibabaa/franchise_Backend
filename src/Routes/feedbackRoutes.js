import {Router} from 'express';

import {createFeedback} from '../../src/controller/FeedbackController/feedbackController.js'



const router = Router();

router.post('/createFeedback',createFeedback);

export default router;
