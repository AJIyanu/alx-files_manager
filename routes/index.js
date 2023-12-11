const express = require('express');
const { getStatus, getStats } = require('../controllers/AppController');

const router = express.Router();

router.get('/status', getStatus);

router.get('/stats', getStats);

module.exports = router;
