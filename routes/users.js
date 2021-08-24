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
  putForgotPassword,
  getResetPassword,
  putPasswordRecovery,
} = require('../controllers/user');

// VIẾT MIDDLEWARE CHECK LOGGEDIN
// GIỮ LẠI GIÁ TRỊ CHO CÁC Ô INPUT
// LOGOUT

router.get('/login', getLogin);
router.post('/login', upload.none(), postLogin);

router.get('/register', getRegister);
router.post('/register', upload.single('image'), postRegister);

router.get('/verification/:user_id/:verification_token', getUserVerification);
router.get('/verification_checkup', getVerificationCheckUp);

router.get('/forgot_password', getForgotPassword);
router.put('/forgot_password', upload.none(), putForgotPassword);
router.get('/reset_password/:reset_password_token', getResetPassword);
router.put('/password_recovery/:reset_password_token', upload.none(), putPasswordRecovery);

module.exports = router;
