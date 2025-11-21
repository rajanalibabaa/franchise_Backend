import { v4 as uuidv4 } from 'uuid';
import ManualLead from '../../model/NewIncomeInvestor/ManualleadSchema.js';
import { InvsRegister } from '../../model/Investor/invsRegister.js';
import { handleNewleads } from '../../utils/AllLeads/handleNewleads.js';
class ManualLeadController {
  // ✅ Create a new manual lead
  async createLead(req, res) {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      state,
      district,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      categories,
      brandName,
      brandId,
      notes,
      tags,
      priority
    } = req.body;

    console.log("===bulk data=== :",req.body)

    const generateuuid = uuidv4()

    // Validation
    if (!fullName || !email || !mobileNumber || !state || !investmentRange || !planToInvest || !readyToInvest) {
      return res.status(400).json({
        success: false,
        statuscode: 400,
        message: 'Required fields are missing',
        data: null
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        statuscode: 400,
        message: 'At least one business category is required',
        data: null
      });
    }

    // Check for duplicate leads
    const existingLead = await ManualLead.findOne({
      $or: [
        { email: email.toLowerCase() },
        { mobileNumber }
      ]
    });

    const existingInvestor = await InvsRegister.findOne({
      $or: [
        { email: email.toLowerCase() },
        { mobileNumber }
      ]
    });

    // Start transaction for data consistency
    const session = await ManualLead.startSession();
    // console.log("session :",session)
    session.startTransaction();

    try {
      let savedLead = existingLead
      if (!existingLead) {
        // Create Manual Lead
      const newLead = new ManualLead({
        uuid: generateuuid,
        fullName: fullName.trim(),
        email: email.toLowerCase()?.trim(),
        mobileNumber: String(mobileNumber).trim(),
        state: state.trim(),
        district: district?.trim() || '',
        city: city?.trim() || '',
        investmentRange,
        planToInvest,
        readyToInvest,
        categories: categories.map(cat => ({
          main: cat.main,
          sub: cat.sub,
          child: cat.child || ''
        })),
        brandName: brandName || 'Manual Entry',
        brandId: brandId || null,
        notes: notes || '',
        tags: tags || [],
        priority: priority || 'medium'
      });

       savedLead = await newLead.save({ session });
      }

      let savedInvestor = existingInvestor;

      // Create Investor Registration only if doesn't exist
      if (!existingInvestor) {
        // Format mobile number to match schema validation (+91xxxxxxxxxx)
        let formattedMobile =String(mobileNumber).trim();
        if (!formattedMobile.startsWith('+91')) {
          // Remove any existing country code and add +91
          formattedMobile = formattedMobile
          formattedMobile = `+91${formattedMobile}`;
        }

        const newInvestor = new InvsRegister({
          firstName: fullName.trim(),
          email: email.toLowerCase().trim(),
          mobileNumber: formattedMobile,
          uuid: generateuuid,
          inveterID: `INV_Admin_Creations_${Date.now()}`, // Generate investor ID
          active: false, // Set as inactive since it's a manual entry
          preferences: [] // Empty preferences array
        });

        savedInvestor = await newInvestor.save({ session });
        await session.commitTransaction();
      session.endSession();
       
      }


      // Commit transaction
      

       res.status(201).json({
        success: true,
        statuscode: 201,
        message: 'Manual lead created successfully',
        data: {
          lead: savedLead,
          investor: savedInvestor ? {
            uuid: savedInvestor.uuid,
            inveterID: savedInvestor.inveterID,
            firstName: savedInvestor.firstName,
            email: savedInvestor.email,
            mobileNumber: savedInvestor.mobileNumber,
            createdAt: savedInvestor.createdAt
          } : null,
          investorExists: !!existingInvestor
        }
      });

      await handleNewleads(
        savedInvestor?.firstName,
        savedInvestor?.email,
        savedInvestor?.mobileNumber,
        categories[0].main,
        categories[0].sub,
        categories[0].child,
        state,
        district,
        city,
        investmentRange,
        planToInvest,
        readyToInvest,
        "admin",
        savedInvestor?.uuid,

      )

      return

    } catch (transactionError) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      statuscode: 500,
      message: 'Failed to create manual lead',
      error: error.message
    });
  }
}


  // ✅ Get all leads with filters + pagination
  async getAllLeads(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        state,
        investmentRange,
        priority,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = { isActive: true };
      if (status) filter.status = status;
      if (state) filter.state = new RegExp(state, 'i');
      if (investmentRange) filter.investmentRange = investmentRange;
      if (priority) filter.priority = priority;

      if (search) {
        filter.$or = [
          { fullName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { mobileNumber: new RegExp(search, 'i') },
          { brandName: new RegExp(search, 'i') }
        ];
      }

      const sortObj = {};
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const leads = await ManualLead.find(filter)
        .sort(sortObj)
        .limit(Number(limit))
        .skip((page - 1) * limit)
        .populate('assignedTo', 'name email')
        .exec();

      const total = await ManualLead.countDocuments(filter);

      res.status(200).json({
        success: true,
        statuscode: 200,
        message: 'Leads retrieved successfully',
        data: {
          leads,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / limit),
            total,
            limit: Number(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all leads error:', error);
      res.status(500).json({
        success: false,
        statuscode: 500,
        message: 'Failed to retrieve leads',
        error: error.message
      });
    }
  }

  // ✅ Get lead by UUID
  async getLeadByUUID(req, res) {
    try {
      const { uuid } = req.params;
      if (!uuid) {
        return res.status(400).json({
          success: false,
          message: 'UUID is required'
        });
      }

      const lead = await ManualLead.findOne({ uuid, isActive: true })
        .populate('assignedTo', 'name email');

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lead retrieved successfully',
        data: lead
      });
    } catch (error) {
      console.error('Get lead by UUID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve lead',
        error: error.message
      });
    }
  }

  // ✅ Update lead
  async updateLead(req, res) {
    try {
      const { uuid } = req.params;
      const updateData = req.body;

      if (!uuid) {
        return res.status(400).json({
          success: false,
          message: 'UUID is required'
        });
      }

      delete updateData.uuid;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      if (updateData.email || updateData.mobileNumber) {
        const duplicateQuery = { isActive: true, uuid: { $ne: uuid } };
        if (updateData.email) duplicateQuery.email = updateData.email.toLowerCase();
        if (updateData.mobileNumber) duplicateQuery.mobileNumber = updateData.mobileNumber;

        const duplicate = await ManualLead.findOne(duplicateQuery);
        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: 'Another lead with this email or mobile number already exists'
          });
        }
      }

      const updatedLead = await ManualLead.findOneAndUpdate(
        { uuid, isActive: true },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name email');

      if (!updatedLead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: updatedLead
      });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lead',
        error: error.message
      });
    }
  }

  // ✅ Delete lead (soft delete)
  async deleteLead(req, res) {
    try {
      const { uuid } = req.params;
      if (!uuid) {
        return res.status(400).json({
          success: false,
          message: 'UUID is required'
        });
      }

      const deletedLead = await ManualLead.findOneAndUpdate(
        { uuid, isActive: true },
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!deletedLead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
        data: { uuid: deletedLead.uuid }
      });
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lead',
        error: error.message
      });
    }
  }

  // ✅ Get lead statistics
  async getLeadStats(req, res) {
    try {
      const stats = await ManualLead.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            newLeads: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
            contactedLeads: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
            qualifiedLeads: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
            convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
            highPriorityLeads: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
          }
        }
      ]);

      const statusDistribution = await ManualLead.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const investmentRangeDistribution = await ManualLead.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$investmentRange', count: { $sum: 1 } } }
      ]);

      res.status(200).json({
        success: true,
        message: 'Lead statistics retrieved successfully',
        data: {
          overview: stats[0] || {
            totalLeads: 0,
            newLeads: 0,
            contactedLeads: 0,
            qualifiedLeads: 0,
            convertedLeads: 0,
            highPriorityLeads: 0
          },
          statusDistribution,
          investmentRangeDistribution
        }
      });
    } catch (error) {
      console.error('Get lead stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve lead statistics',
        error: error.message
      });
    }
  }
}

// ✅ Export named functions for direct import
export const {
  createLead,
  getAllLeads,
  getLeadByUUID,
  updateLead,
  deleteLead,
  getLeadStats
} = new ManualLeadController();

export default ManualLeadController;
