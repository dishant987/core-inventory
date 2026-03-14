import { Partner } from '../models/index.js';

// @desc    Get all partners
// @route   GET /api/partners
// @access  Private
export const getPartners = async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = { isActive: true };

    if (type && type !== 'all') {
      query.$or = [{ type: type }, { type: 'Both' }];
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const partners = await Partner.find(query).sort({ name: 1 });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a partner
// @route   POST /api/partners
// @access  Private
export const createPartner = async (req, res) => {
  try {
    const { name, type, email, phone, address, gstNumber } = req.body;

    const partner = new Partner({
      name,
      type,
      email,
      phone,
      address,
      gstNumber,
      createdBy: req.user._id,
    });

    const createdPartner = await partner.save();
    res.status(201).json(createdPartner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a partner
// @route   PUT /api/partners/:id
// @access  Private
export const updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (partner) {
      partner.name = req.body.name || partner.name;
      partner.type = req.body.type || partner.type;
      partner.email = req.body.email || partner.email;
      partner.phone = req.body.phone || partner.phone;
      partner.address = req.body.address || partner.address;
      partner.gstNumber = req.body.gstNumber || partner.gstNumber;
      partner.isActive = req.body.isActive !== undefined ? req.body.isActive : partner.isActive;

      const updatedPartner = await partner.save();
      res.json(updatedPartner);
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a partner (soft delete)
// @route   DELETE /api/partners/:id
// @access  Private
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (partner) {
      partner.isActive = false;
      await partner.save();
      res.json({ message: 'Partner removed' });
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
