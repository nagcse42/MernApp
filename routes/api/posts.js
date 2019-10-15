const express = require('express');
const router = express.Router();

/**
 * @route   GET api/posts
 * @desc    Test API
 * @access  Public
 */
router.get('/', (req, res) => res.send('Posts default Route'));

module.exports = router;