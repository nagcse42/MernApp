const express = require('express');
const router = express.Router();

/**
 * @route   GET api/auth
 * @desc    Test API
 * @access  Public
 */
router.get('/', (req, res) => res.send('Auth default Route'));

module.exports = router;