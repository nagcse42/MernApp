const express = require('express');
const router = express.Router();

/**
 * @route   GET api/profiles
 * @desc    Test API
 * @access  Public
 */
router.get('/', (req, res) => res.send('Profile default Route'));

module.exports = router;