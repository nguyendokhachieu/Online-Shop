const express = require('express');
const router = express.Router();
const { 
  getDashboardHomePage,
} = require('../controllers/dashboard'); 

router.get('/', getDashboardHomePage);

module.exports = router;
