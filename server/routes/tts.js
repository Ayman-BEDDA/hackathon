const express = require('express');
const say = require('say');
const path = require('path');
const fs = require('fs');
const TtsController = require('../controllers/tts');

const router = express.Router();

router.post('/response-vocal', TtsController.speak);

module.exports = router;