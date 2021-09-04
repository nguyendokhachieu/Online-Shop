const Product = require('../models/product');
const User = require('../models/user');
const Review = require('../models/review');

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
    },

    async isAllProductsMine(req, res, next) {
        try {
            if (req.body.deleteManyCheckbox && req.body.deleteManyCheckbox.length) {
                for (const deleteId of req.body.deleteManyCheckbox) {
                    let product = await Product.findById(deleteId);

                    if (!product) {
                        req.session.errorMsg = 'Không tìm thấy một hoặc nhiều sản phẩm!';
                        return res.redirect('/dashboard/products');
                    }

                    if (!product.seller.equals(req.user._id)) {
                        req.session.errorMsg = 'Truy cập bị từ chối!';
                        return res.redirect('/dashboard/products');
                    }

                    return next();
                }
            } else {
                req.session.errorMsg = 'Vui lòng chọn ít nhất một mục!';
                return res.render('error/index');
            }
        } catch (error) {
            req.session.errorMsg = 'Có lỗi xảy ra, xin vui lòng thử lại!';
            return res.render('error/index');
        }
    },

    async isMyself(req, res, next) {
        try {
            const user = await User.findOne({
                username: req.params.username
            });

            if (!user) {
                req.session.errorMsg = 'Cannot find current user';
                return res.render('error/index');
            }

            if (!user.equals(req.user._id)) {
                req.session.errorMsg = 'Access denied!';
                return res.render('error/index');
            }

            return next();
        } catch (error) {
            req.session.errorMsg = 'Cannot find current user';
            return res.render('error/index');
        }
    },

    async checkOneTimeReview(req, res, next) {
        try {
            const review = await Review.findOne({
                creator: req.user._id,
                productId: req.body.productId,
            });


            if (!review) return next();
            else return res.json({
                ok: false,
                errorMsg: 'You can only review this product one time!'
            })
        } catch (error) {
            return res.json({
                ok: false,
                errorMsg: 'You can only review this product one time!'
            })
        }
    }
}