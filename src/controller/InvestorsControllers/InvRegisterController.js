
// import { InvsRegister } from "../../models/Investor/invsRegister.js";

import { InvsRegister } from "../../model/Investor/invsRegister.js";

export const createInvestor = async (req, res) => {
    try {
      const investor = new InvsRegister(req.body);
      await investor.save();
      res.status(201).json(investor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  export const getAllInvestors = async (req, res) => {
    try {
      const investors = await InvsRegister.find();
      res.status(200).json(investors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const getInvestorById = async (req, res) => {
    try {
      const investor = await InvsRegister.findById(req.params.id);
      if (!investor) return res.status(404).json({ error: 'Investor not found' });
      res.status(200).json(investor);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const updateInvestor = async (req, res) => {
    try {
      const investor = await InvsRegister.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!investor) return res.status(404).json({ error: 'Investor not found' });
      res.status(200).json(investor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  
  export const deleteInvestor = async (req, res) => {
    try {
      const investor = await InvsRegister.findByIdAndDelete(req.params.id);
      if (!investor) return res.status(404).json({ error: 'Investor not found' });
      res.status(200).json({ message: 'Investor deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };