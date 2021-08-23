const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
  getLogin,
  getRegister,
  postRegister,
  getUserVerification,
  getVerificationCheckUp,
  postLogin,
  getForgotPassword,
} = require('../controllers/user');

// VIẾT MIDDLEWARE CHECK LOGGEDIN

// LOGOUT

router.get('/login', getLogin);
router.post('/login', upload.none(), postLogin);

router.get('/register', getRegister);
router.post('/register', upload.single('image'), postRegister);

router.get('/verification/:user_id/:verification_token', getUserVerification);
router.get('/verification_checkup', getVerificationCheckUp);

router.get('/forgot_password', getForgotPassword);

module.exports = router;
