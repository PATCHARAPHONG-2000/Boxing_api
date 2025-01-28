const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

router.get('/', matchController.getAllMatches);
router.post('/', matchController.addMatch);
router.put('/', matchController.updateMatch);


module.exports = router;