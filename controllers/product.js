const striptags = require('striptags');
const { cloudinary, geocoding } = require('../helpers');
const Product = require('../models/product');

module.exports = {
    getCreateNewProduct(req, res, next) {
        res.render('product/createNew');
    },

    async postCreateNewProduct(req, res, next) {
        try {
            if (!req.body.title.trim().length) {
                req.session.errorMsg = 'Title cannot be an empty string!';
                return res.redirect('/products/create_new');
            }
            
            if (isNaN(req.body.price)) {
                req.session.errorMsg = 'Price must be a number!';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.price) < 0) {
                req.session.errorMsg = 'Price must be greater than or equal to 0!';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.province) === 0) {
                req.session.errorMsg = 'Please choose province!';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.district) === 0) {
                req.session.errorMsg = 'Please choose district!';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.ward) === 0) {
                req.session.errorMsg = 'Please choose ward!';
                return res.redirect('/products/create_new');
            }

            if (req.files && req.files.length) {
                for (const file of req.files) {
                    if (!file.mimetype.startsWith('image')) {
                        req.session.errorMsg = 'One or multiple files are not in image format!';
                        return res.redirect('/products/create_new');
                    }
                }
            }

            const title = striptags(req.body.title.trim());
            const price = Number(req.body.price);
            const description = striptags(req.body.description.trim(), [
                'p', 'h1', 'h2', 'h3', 'h4', 'strong', 'i', 'a', 'ul', 'li', 'ol', 'blockquote', 'figure', 'table', 'tbody', 'tr', 'td'
            ]);
            const province = req.body.province.split('-')[1];
            const district = req.body.district.split('-')[1];
            const ward = req.body.ward.split('-')[1];

            // validate in client side
            const geoJSON = await geocoding(`${ward} ${district} ${province}`);

            const product = {
                title, 
                price,
                description,
                location: {
                    province,
                    district,
                    ward,
                },
                geoJSON,
                seller: req.user._id,
                images: [],
            };
            
            if (req.files && req.files.length) {
                for (const img of req.files) {
                    const uploaded = await cloudinary.uploader.upload(img.path);
                    
                    product.images.push({
                        secure_url: uploaded.secure_url,
                        public_id: uploaded.public_id,
                    });
                }
            }
            
            const newProduct = await Product.create(product);

            req.session.successMsg = 'New product created successfully!';
            res.redirect(`/products/${newProduct.id}`);

        } catch (error) {
            req.session.errorMsg = 'Some unexpected errors happened when we tried to create new post! Please try again!';
            return res.redirect('/products/create_new');
        } 
    },

    async getShowSingleProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id).populate({
                path: 'seller',
            });

            if (!product) {
                req.session.errorMsg = 'Sorry, we cannot find the product that you requested!';
                return res.render('error/index');
            }
            
            res.render('product/showSingle', { product });
        } catch (error) {
            req.session.errorMsg = 'Sorry, we cannot find the product that you requested!';
            return res.render('error/index');
        }
    },

    getEditSingleProduct(req, res, next) {

    },

    async putEditSingleProduct(req, res, next) {
        try {
            
        } catch (error) {
            
        }
    }
}