const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let appointments;

    if (user.role === 'doctor') {
      appointments = await Appointment.find({ doctorId: req.user.id })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'specialization fees');
    } else {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate('doctorId', 'specialization fees');
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/appointments
// @desc    Create an appointment
// @access  Private
router.post('/', [
  auth,
  [
    check('doctorId', 'Doctor ID is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('time', 'Time is required').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId: req.body.doctorId,
      date: req.body.date,
      time: req.body.time,
      amount: req.body.amount,
      notes: req.body.notes
    });

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/appointments/:id
// @desc    Update appointment status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role === 'doctor' && appointment.doctorId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (user.role === 'patient' && appointment.patientId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 