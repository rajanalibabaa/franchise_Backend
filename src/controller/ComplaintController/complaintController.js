import { Complaint } from '../../model/Complaint/complaintModel.js';

export const createComplaint = async (req, res) => {
    try {
        const { topic, complaint } = req.body;
        const newComplaint = new Complaint({ topic, complaint });
        await newComplaint.save();
        res.status(201).json({ message: 'Complaint created successfully', data: newComplaint });
    } catch (error) {
        res.status(500).json({ message: 'Error creating complaint', error: error.message });
    }
}