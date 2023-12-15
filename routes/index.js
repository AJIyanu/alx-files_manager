const express = require('express');
const { getStatus, getStats } = require('../controllers/AppController');
const { postNew, getMe } = require('../controllers/UsersController');
const { getConnect, getDisconnect } = require('../controllers/AuthController');
const { postUpload, getShow, getIndex, putPublish, putUnpublish } = require('../controllers/FilesController');

const router = express.Router();

router.get('/status', getStatus);

router.get('/stats', getStats);

router.post('/users', postNew);

router.get('/connect', getConnect);

router.get('/disconnect', getDisconnect);

router.get('/users/me', getMe);

router.post('/files', postUpload);

router.get('/files/:id', getShow);

router.get('/files', getIndex);

router.put('/files/:id/unpublish', putUnpublish);

router.put('/files/:id/publish', putPublish);

module.exports = router;
