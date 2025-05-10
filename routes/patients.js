const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/patients
// @desc    Get all patients
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const patient = await User.findById(req.params.id).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Only allow access if user is admin, doctor, or the patient themselves
    if (user.role !== 'admin' && user.role !== 'doctor' && user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(patient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/patients/:id
// @desc    Update patient profile
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let patient = await User.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Only allow access if user is admin or the patient themselves
    if (user.role !== 'admin' && user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    const { name, phone, address } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    patient = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 