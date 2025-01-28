// routes/loginRoutes.js
const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.get('/', loginController.getAllLogin);
router.post('/', loginController.loginadmin);

module.exports = router;
