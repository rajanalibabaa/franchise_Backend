import { PostRequirement } from '../../model/Post Requirement/postRequirement.js';

export const createPostRequirement = async (req, res) => {
  try {
    const {
      name,
      address,
      country,
      pincode,
      city,
      state,
      mobileNumber,
      whatsappNumber,
      email,
      industryType,
      investmentRange,
      floorAreaRequirement,
      timelineToStart,
      needLoan,
    } = req.body;

    const newRequirement = new PostRequirement({
      name,
      address,
      country,
      pincode,
      city,
      state,
      mobileNumber,
      whatsappNumber,
      email,
      industryType,
      investmentRange,
      floorAreaRequirement,
      timelineToStart,
      needLoan,
    });

    await newRequirement.save();
    res.status(201).json({ message: 'PostRequirement created successfully', data: newRequirement });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllPostRequirement = async (req, res) => {
  try {
    const allRequirements = await PostRequirement.find();
    res.status(200).json({ message: 'PostRequirements fetched successfully', data: allRequirements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPostRequirementById = async (req, res) => {
  try {
    const requirement = await PostRequirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ error: 'PostRequirement not found' });
    res.status(200).json({ message: 'PostRequirement fetched successfully', data: requirement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPostRequirementByUUID = async (req, res) => {
  try {
    const requirement = await PostRequirement.findOne({ uuid: req.params.uuid });
    if (!requirement) return res.status(404).json({ error: 'PostRequirement not found' });
    res.status(200).json({ message: 'PostRequirement fetched successfully', data: requirement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePostRequirement = async (req, res) => {
  try {
    const updatedRequirement = await PostRequirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRequirement) return res.status(404).json({ error: 'PostRequirement not found' });
    res.status(200).json({ message: 'PostRequirement updated successfully', data: updatedRequirement });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePostRequirement = async (req, res) => {
  try {
    const deletedRequirement = await PostRequirement.findByIdAndDelete(req.params.id);
    if (!deletedRequirement) return res.status(404).json({ error: 'PostRequirement not found' });
    res.status(200).json({ message: 'PostRequirement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};