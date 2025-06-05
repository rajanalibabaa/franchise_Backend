import { Complaint } from '../../model/Complaint/complaintModel.js';
import { ApiResponse } from '../../utils/ApiResponse/ApiResponse.js';

export const createComplaint = async (req, res) => {
    try {
            const {id} = req.params
            const investor = req.investorUser
            const brandUser = req.brandUser
            const { topic, complaint } = req.body;
            if (id !== brandUser?.uuid && id !== investor?.uuid ) {
                    return res.json(
                        new ApiResponse(401,{},"Unauthorized request")
                    )
                }
        let newComplaint;
        if (investor) {
             newComplaint = new Complaint({ topic, complaint, ownerId:investor.uuid,userType:"investor" });
             await newComplaint.save();
        }
        if (brandUser) {
             newFeedback = new Complaint({ topic, complaint,ownerId:investor.uuid,userType:"brand" });
             await newFeedback.save();
        }

        if (!newComplaint) {
            return res.json(new ApiResponse(505,null,"Some think went wrong while saving the Complaint in database"))
        }
        


        return res.json(new ApiResponse(200,newComplaint,"Complaint send successfully"))       
    } catch (error) {
        res.status(500).json({ message: 'Error creating complaint', error: error.message });
    }
}