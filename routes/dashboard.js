const express = require('express');
const router = express.Router();
const { 
  getDashboardHomePage,
  getDashboardChangePasswordPage,
  getDashboardAvatarUploadPage,
} = require('../controllers/dashboard'); 
const {
  isLoggedIn
} = require('../middlewares');

router.get('/products', isLoggedIn, getDashboardHomePage);
router.get('/change_password', isLoggedIn, getDashboardChangePasswordPage);
router.get('/avatar_upload', isLoggedIn, getDashboardAvatarUploadPage);

module.exports = router;
