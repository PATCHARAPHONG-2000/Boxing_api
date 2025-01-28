const express = require('express');
const router = express.Router();
const sportPersonController = require('../controllers/sportPersonController');
const upload = require('../middlewares/upload');

router.get('/', sportPersonController.getAllSportPersons);
router.get('/:id', sportPersonController.getAllSportPersons);
router.post('/', upload.fields([{ name: 'image_red' }, { name: 'image_blue' }]), sportPersonController.addSportPerson);
router.put('/:id', upload.fields([{ name: 'image_red' }, { name: 'image_blue' }]), sportPersonController.updateSportPerson);
router.put('/status/:id', sportPersonController.updateSportPersonStatus);
router.post('/round', sportPersonController.updateSportPersonRound); // เปลี่ยนจาก PUT เป็น POST
router.delete('/:id', sportPersonController.deleteSportPerson);

module.exports = router;