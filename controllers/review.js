const striptags = require('striptags');
const Review = require('../models/review');
const Product = require('../models/product');

module.exports = {
    async postCreateNewReview(req, res, next) {
        try {
            const product = await Product.findById(req.body.productId);

            if (!product) {
                req.session.errorMsg = 'There is no product!';
                return res.render('error/index');
            }

            if (req.body.reviewRating < 1 || req.body.reviewRating > 5) {
                return res.json({
                    ok: false,
                    errorMsg: 'Review rating must be greater than 0 and less than 6' 
                })
            }

            const review = await Review.create({
                body: striptags(req.body.reviewBody.trim()),
                rating: req.body.reviewRating,
                creator: req.user._id,
                productId: req.body.productId,
                createdAt: Date.now(),
            });

            return res.json({ 
                review: {
                    id: review.id,
                    body: review.body,
                    rating: review.rating,
                    authorUsername: req.user.username,
                }, 
                ok: true 
            });
        } catch (error) {
            return res.json({
                ok: false,
                errorMsg: 'Some unexpected errors happened! Please try again!' 
            })
        }
    },

    async deleteSingleReview(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id);
            
            if (!product) {
                return res.json({
                    ok: false,
                    errorMsg: 'Sorry, we cannot find product',
                })
            }

            const review = await Review.findById(req.params.review_id);

            if (!review) {
                return res.json({
                    ok: false,
                    errorMsg: 'Sorry, we cannot find your review or your review had been removed before!',
                })
            }

            await Review.findByIdAndRemove(req.params.review_id);

            return res.json({
                ok: true,
            })
        } catch (error) {
            return res.json({
                ok: false,
                errorMsg: 'Sorry, we cannot find your review or your review had been removed before!',
            })
        }
    },

    async putEditSingleReview(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id);

            if (!product) {
                req.session.errorMsg = 'There is no product!';
                return res.render('error/index');
            }

            if (req.body.reviewRating < 1 || req.body.reviewRating > 5) {
                return res.json({
                    ok: false,
                    errorMsg: 'Review rating must be greater than 0 and less than 6' 
                })
            }

            const review = await Review.findById(req.params.review_id);

            if (!review) {
                return res.json({
                    ok: false,
                    errorMsg: 'Sorry, no review found!', 
                })
            }

            review.body = req.body.reviewBody;
            review.rating = req.body.reviewRating;
            await review.save();

            return res.send({ 
                review: {
                    id: review.id,
                    body: review.body,
                    rating: review.rating,
                    authorUsername: req.user.username,
                }, 
                ok: true,
            });
        } catch (error) {
            return res.json({
                ok: false,
                errorMsg: 'Some unexpected errors happened! Please try again!' 
            })
        }
    }
}