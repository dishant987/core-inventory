import { Location } from '../models/index.js';

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private
export const getLocations = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = {};
    if (status === 'deleted') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
      if (status && status !== 'all') {
        query.isActive = status === 'active';
      }
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }

    const locations = await Location.find(query).populate('parentId', 'name type');
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Private
export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findOne({ _id: req.params.id }).populate('parentId', 'name type');
    if (location) {
      res.json(location);
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a location
// @route   POST /api/locations
// @access  Private/Admin
export const createLocation = async (req, res) => {
  try {
    const { name, type, parentId, isActive } = req.body;

    const locationExists = await Location.findOne({ name, isDeleted: false });
    if (locationExists) {
      return res.status(400).json({ message: 'Location name already exists' });
    }

    const location = new Location({
      name,
      type: type || 'Internal',
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
    });

    const createdLocation = await location.save();
    res.status(201).json(createdLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a location
// @route   PUT /api/locations/:id
// @access  Private/Admin
export const updateLocation = async (req, res) => {
  try {
    const { name, type, parentId, isActive, isDeleted } = req.body;

    const location = await Location.findOne({ _id: req.params.id });

    if (location) {
      location.name = name || location.name;
      if (type) location.type = type;
      if (parentId !== undefined) location.parentId = parentId === "" ? null : parentId;
      if (isActive !== undefined) location.isActive = isActive;
      if (isDeleted !== undefined) location.isDeleted = isDeleted;

      const updatedLocation = await location.save();
      res.json(updatedLocation);
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a location (Soft Delete)
// @route   DELETE /api/locations/:id
// @access  Private/Admin
export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findOne({ _id: req.params.id, isDeleted: false });

    if (location) {
      location.isDeleted = true;
      location.isActive = false;
      await location.save();
      res.json({ message: 'Location removed' });
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
