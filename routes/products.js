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
    deleteSingleProduct,
} = require('../controllers/product');
const { 
    isLoggedIn,
    isProductSeller,
} = require('../middlewares');

router.get('/create_new', isLoggedIn, getCreateNewProduct);
router.post('/create_new', upload.array('images', 4), isLoggedIn, postCreateNewProduct);

router.get('/:product_id/edit', isLoggedIn, isProductSeller, getEditSingleProduct);
router.put('/:product_id/edit', upload.array('images', 4), isLoggedIn, isProductSeller, putEditSingleProduct);

router.delete('/:product_id/delete', isLoggedIn, isProductSeller, deleteSingleProduct);

router.get('/:product_id', getShowSingleProduct);

module.exports = router;
