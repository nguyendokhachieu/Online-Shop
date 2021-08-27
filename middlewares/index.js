const Product = require('../models/product');

module.exports = {
    isLoggedIn(req, res, next) {
        const url = req.protocol + '://' + req.get('host') + req.originalUrl;

        if(req.isAuthenticated()) return next();
        res.redirect(`/user/login?_continue=${url}`);
    },

    async isProductSeller(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id);

            if (!product) {
                req.session.errorMsg = 'Not found';
                return res.render('error/index');
            }

            if (!product.seller.equals(req.user._id)) {
                req.session.errorMsg = 'Access denied!';
                return res.render('error/index');
            }

            return next();
        } catch (error) {
            req.session.errorMsg = 'Not found';
            return res.render('error/index');
        }
    }
}