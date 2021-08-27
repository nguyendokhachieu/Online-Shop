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
            const province = req.body.province;
            const district = req.body.district;
            const ward = req.body.ward;

            // validate in client side
            const geoJSON = await geocoding(`${ward.split('-')[1]} ${district.split('-')[1]} ${province.split('-')[1]}`);

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

    async getEditSingleProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id);

            if (!product) {
                req.session.errorMsg = 'Sorry, we cannot find the product that you requested!';
                return res.render('error/index');
            }

            return res.render('product/editSingle', { product });

        } catch (error) {
            req.session.errorMsg = 'Sorry, we cannot find the product that you requested!';
            return res.render('error/index');
        }
    },

    async putEditSingleProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id);

            if (!product) {
                req.session.errorMsg = 'Sorry, we cannot find the product that you requested!';
                return res.render('error/index');
            }

            if (!req.body.title.trim().length) {
                req.session.errorMsg = 'Title cannot be an empty string!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }
            
            if (isNaN(req.body.price)) {
                req.session.errorMsg = 'Price must be a number!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.price) < 0) {
                req.session.errorMsg = 'Price must be greater than or equal to 0!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.province) === 0) {
                req.session.errorMsg = 'Please choose province!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.district) === 0) {
                req.session.errorMsg = 'Please choose district!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.ward) === 0) {
                req.session.errorMsg = 'Please choose ward!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (req.files && req.files.length) {
                for (const file of req.files) {
                    if (!file.mimetype.startsWith('image')) {
                        req.session.errorMsg = 'One or multiple files are not in image format!';
                        return res.redirect(`/products/${req.params.product_id}/edit`);
                    }
                }
            }

            const deletedImagesLength = req.body.deletedImages.length || 0;
            const newImagesLength = req.files.length || 4;
            const currentImagesLength = product.images.length;

            if (currentImagesLength - deletedImagesLength + newImagesLength > 4) {
                req.session.errorMsg = 'Sorry, you can only upload maximum of 4 images per product!';
                return res.render('error/index');
            }

            product.title = req.body.title.trim();
            product.price = Number(req.body.price);
            product.description = striptags(req.body.description.trim(), [
                'p', 'h1', 'h2', 'h3', 'h4', 'strong', 'i', 'a', 'ul', 'li', 'ol', 'blockquote', 'figure', 'table', 'tbody', 'tr', 'td'
            ]);

            if ((product.location.province !== req.body.province) || (product.location.district !== req.body.district) || (product.location.ward !== req.body.ward)) {
                const geoJSON = await geocoding(`${req.body.ward.split('-')[1]} ${req.body.district.split('-')[1]} ${req.body.province.split('-')[1]}`);

                product.geoJSON = geoJSON;
                product.location.province = req.body.province;
                product.location.district = req.body.district;
                product.location.ward = req.body.ward;
            }

            if (req.body.deletedImages && req.body.deletedImages.length) {
                for (const deletePublicId of req.body.deletedImages) {
                    await cloudinary.uploader.destroy(deletePublicId);

                    for (const img of product.images) {
                        if (img.public_id === deletePublicId) {
                            const index = product.images.indexOf(img);
                            product.images.splice(index, 1);
                        }
                    }
                }
            }

            if (req.files && req.files.length) {
                for (const newImg of req.files) {
                    const newUpload = await cloudinary.uploader.upload(newImg.path);

                    product.images.push({
                        secure_url: newUpload.secure_url,
                        public_id: newUpload.public_id,
                    })
                }
            }

            await product.save();
            req.session.successMsg = 'Edited your product successfully!';
            return res.redirect(`/products/${product.id}`);
        } catch (error) {
            req.session.errorMsg = 'Sorry, some unexpected errors happened while we tried to edit your product, please try again!';
            return res.render('error/index');
        }
    },

    async deleteSingleProduct(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id);

            if (!product) {
                req.session.errorMsg = 'Error finding your product!';
                return res.render('error/index');
            }

            if (product.images && product.images.length) {
                for (const img of product.images) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }

            await Product.findByIdAndRemove(product.id);

            req.session.successMsg = 'Successfully deleted your product!';
            return res.redirect('/products');
        } catch (error) {
            req.session.errorMsg = 'Error finding your product!';
            return res.render('error/index');
        }
    },

    async getShowProductsPaginate(req, res, next) {
        try {
            const productsPaginate = await Product.paginate({}, {
                sort: { _id: -1 },
                limit: 5,
                page: req.query.page || 1,
                populate: {
                    path: 'seller'
                }
            });

            // productsPaginate.docs
            // productsPaginate.totalDocs = 100
            // productsPaginate.limit = 10
            // productsPaginate.page = 1
            // productsPaginate.totalPages = 10
            // productsPaginate.hasNextPage = true
            // productsPaginate.nextPage = 2
            // productsPaginate.hasPrevPage = false
            // productsPaginate.prevPage = null
            // productsPaginate.pagingCounter = 1

            res.render('product/showProductsPaginate', { productsPaginate });
        } catch (error) {
            req.session.errorMsg = 'Error finding products';
            return res.render('error/index');
        }
    }
}