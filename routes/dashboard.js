const express = require('express');
const router = express.Router();
const { 
  getDashboardHomePage,
} = require('../controllers/dashboard'); 
const {
  isLoggedIn
} = require('../middlewares');

router.get('/products', isLoggedIn, getDashboardHomePage);

module.exports = router;
