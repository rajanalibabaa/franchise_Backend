import InstaApply from "../../model/InstaApply/instaModel.js";
import { sendInstantApplyEmail } from '../../utils/Centralized Email/centralizedEmail.js';

export const createInstaApply = async (req, res) => {
    try {
        const { name, email, mobilenumber, state, city, pincode, address } = req.body;
        const newInstaApply = new InstaApply({ name, email, mobilenumber, state, city, pincode, address });
        await newInstaApply.save();
        
        // Send email after successful save
        await sendInstantApplyEmail(email, name, mobilenumber, state, city, pincode, address);
        
        res.status(201).json({ message: 'Insta Apply created successfully', data: newInstaApply });
    } catch (error) {
        res.status(500).json({ message: 'Error creating Insta Apply', error: error.message });
    }
};

export const getInstaApply = async (req, res) => {
    try {
        const instaApply = await InstaApply.find();
        res.status(200).json({ message: 'Insta Apply fetched successfully', data: instaApply });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Insta Apply', error: error.message });
    }
};

export const getInstaApplyById = async (req, res) => {
    try {
        const { id } = req.params;
        const instaApply = await InstaApply.findById(id);
        if (!instaApply) {
            return res.status(404).json({ message: 'Insta Apply not found' });
        }
        res.status(200).json({ message: 'Insta Apply fetched successfully', data: instaApply });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching Insta Apply', error: error.message });
    }
};


export const updateInstaApply = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobilenumber, state, city, pincode, address } = req.body;
        const updatedInstaApply = await InstaApply.findByIdAndUpdate(id, { name, email, mobilenumber, state, city, pincode, address }, { new: true });
        if (!updatedInstaApply) {
            return res.status(404).json({ message: 'Insta Apply not found' });
        }
        res.status(200).json({ message: 'Insta Apply updated successfully', data: updatedInstaApply });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Insta Apply', error: error.message });
    }
};

export const deleteInstaApply = async (req,res)=>{
    try {
        const { id } = req.params;
        const deletedInstaApply = await InstaApply.findByIdAndDelete(id);
        if (!deletedInstaApply) {
            return res.status(404).json({ message: 'Insta Apply not found' });
        }
        res.status(200).json({ message: 'Insta Apply deleted successfully', data: deletedInstaApply }); 

    }
     catch (error) {
        res.status(500).json({ message: 'Error deleting Insta Apply', error: error.message });
    }
};