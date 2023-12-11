const express = require('express');
const { getStatus, getStats } = require('../controllers/AppController');
const { postNew } = require('../controllers/UsersController');

const router = express.Router();

router.get('/status', getStatus);

router.get('/stats', getStats);

router.post('/users', postNew);

module.exports = router;
