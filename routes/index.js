const express = require('express');
const router = express.Router();

router.get('/status', AppController.static);

router.get('/stats', AppController.stats);

module.exports = router
