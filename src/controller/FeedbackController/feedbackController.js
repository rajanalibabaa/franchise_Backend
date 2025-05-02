import  { InvFeedback } from '../../model/Feedback/feedbackModel.js';

 
export const createFeedback = async (req, res) => {
    try {
        const { topic, feedback, rating } = req.body;
        const newFeedback = new InvFeedback({ topic, feedback, rating });
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback created successfully', data: newFeedback });
    } catch (error) {
        res.status(500).json({ message: 'Error creating feedback', error: error.message });
    }
}

























;

