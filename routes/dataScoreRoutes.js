const express = require('express');
const router = express.Router();
const dataScoreController = require('../controllers/dataScoreController');

router.get('/', dataScoreController.getAllMatches);
router.post('/', dataScoreController.addScore);
router.post('/manual', dataScoreController.saveManualScores);
router.put('/', dataScoreController.updatedScores);


module.exports = router;