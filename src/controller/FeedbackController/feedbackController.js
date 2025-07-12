import  { InvFeedback } from '../../model/Feedback/feedbackModel.js';
import { ApiResponse } from '../../utils/ApiResponse/ApiResponse.js';

 
export const createFeedback = async (req, res) => {
    try {
        const {id} = req.params
        const investor = req?.investorUser
        const brandUser = req?.brandUser
        const { topic, feedback, rating } = req.body


        if (id !== brandUser?.uuid && id !== investor?.uuid ) {
            return res.json(
                new ApiResponse(401,{},"Unauthorized request")
            )
        }

        let newFeedback;
        if (investor) {
             newFeedback = new InvFeedback({ topic, feedback, rating,ownerId:investor.uuid,userType:"investor" });
             await newFeedback.save();
        }
        if (brandUser) {
             newFeedback = new InvFeedback({ topic, feedback, rating,ownerId:investor.uuid,userType:"brand" });
             await newFeedback.save();
        }

        if (!newFeedback) {
            return res.json(new ApiResponse(505,null,"Some think went wrong while saving the data in database"))
        }
        


        return res.json(new ApiResponse(200,newFeedback,"Feedback send successfully"))
    } catch (error) {
        res.status(500).json({ message: 'Error creating feedback', error: error.message });
    }
};



























