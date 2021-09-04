const Product = require('../models/product');

module.exports = {
    async getDashboardHomePage(req, res, next) {
        try {
            const productsPaginate = await Product.paginate({
                seller: req.user._id
            }, {
                limit: 5,
                page: req.query.page || 1, 
                sort: { _id: -1 },
            });

            return res.render('dashboard/index', { productsPaginate });
        } catch (error) {
            req.session.errorMsg = 'Có lỗi xảy ra, thử tải lại trang!';
            return res.render('error/index');
        }
    },

    getDashboardChangePasswordPage(req, res, next) {
        return res.render('dashboard/changePassword');
    },

    async getDashboardAvatarUploadPage(req, res, next) {
        return res.render('dashboard/avatarUpload');
    }
    
}