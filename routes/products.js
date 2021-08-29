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
    getShowProductsPaginate,
} = require('../controllers/product');
const {
    postCreateNewReview,
    deleteSingleReview,
    putEditSingleReview,
} = require('../controllers/review');
const { 
    isLoggedIn,
    isProductSeller,
} = require('../middlewares');

router.get('/create_new', isLoggedIn, getCreateNewProduct);
router.post('/create_new', upload.array('images', 4), isLoggedIn, postCreateNewProduct);

// one person review one product one time
router.delete('/:product_id/reviews/:review_id', isLoggedIn, deleteSingleReview);
router.put('/:product_id/reviews/:review_id', isLoggedIn, putEditSingleReview);
router.post('/:product_id/reviews', upload.none(), isLoggedIn, postCreateNewReview);

router.get('/:product_id/edit', isLoggedIn, isProductSeller, getEditSingleProduct);
router.put('/:product_id/edit', upload.array('images', 4), isLoggedIn, isProductSeller, putEditSingleProduct);

router.delete('/:product_id/delete', isLoggedIn, isProductSeller, deleteSingleProduct);

router.get('/:product_id', getShowSingleProduct);

router.get('/', getShowProductsPaginate);

module.exports = router;
