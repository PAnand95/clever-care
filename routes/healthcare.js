const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configuration for the Flask backend
const FLASK_BACKEND_URL = 'http://localhost:5001';  // Note: Using 5001 to avoid conflict with main server

// @route   POST api/healthcare/predict
// @desc    Get healthcare prediction from Python backend
// @access  Private
router.post('/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        const response = await axios.post(`${FLASK_BACKEND_URL}/predict`, { symptoms });
        res.json(response.data);
    } catch (error) {
        console.error('Error in disease prediction:', error);
        res.status(500).json({ error: 'Failed to get prediction' });
    }
});

module.exports = router; 