const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
  getLogin,
  getRegister,
  postRegister,
  getUserVerification,
  postLogin,
  getForgotPassword,
  putForgotPassword,
  getResetPassword,
  putPasswordRecovery,
  getLogout,
  getShowUserProfile,
  patchChangeUserProfileImage,
} = require('../controllers/user');
const {
  isLoggedIn,
  isMyself,
} = require('../middlewares');
// GIỮ LẠI GIÁ TRỊ CHO CÁC Ô INPUT

router.get('/login', getLogin);
router.post('/login', upload.none(), postLogin);

router.get('/logout', getLogout);

router.get('/register', getRegister);
router.post('/register', upload.single('image'), postRegister);

router.get('/verification/:user_id/:verification_token', getUserVerification);

router.get('/forgot_password', getForgotPassword);
router.put('/forgot_password', upload.none(), putForgotPassword);
router.get('/reset_password/:reset_password_token', getResetPassword);
router.put('/password_recovery/:reset_password_token', upload.none(), putPasswordRecovery);

router.patch('/profile/:username/profile_image', upload.single('image'), isLoggedIn, isMyself, patchChangeUserProfileImage);
router.get('/profile/:username', getShowUserProfile);

module.exports = router;
