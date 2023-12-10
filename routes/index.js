const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
    res.send(AppController.getStatus);
})

router.get('/stats', (req, res) => {
    res.send(AppController.getStats);
})

module.exports = router
