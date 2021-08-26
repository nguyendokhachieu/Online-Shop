const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {  
    getCreateNewProduct,
    postCreateNewProduct,
    getShowSingleProduct,
    getEditSingleProduct,
    putEditSingleProduct,
} = require('../controllers/product');
const { isLoggedIn } = require('../middlewares');

router.get('/create_new', isLoggedIn, getCreateNewProduct);
router.post('/create_new', upload.array('images', 4), isLoggedIn, postCreateNewProduct);

router.get('/:product_id/edit', getEditSingleProduct);
router.put('/:product_id/edit', putEditSingleProduct);
router.get('/:product_id', getShowSingleProduct);

module.exports = router;
