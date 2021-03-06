const striptags = require('striptags');
const { cloudinary, geocoding } = require('../helpers');
const Product = require('../models/product');
const Review = require('../models/review');

module.exports = {
    getCreateNewProduct(req, res, next) {
        res.render('product/createNew');
    },

    async postCreateNewProduct(req, res, next) {
        try {
            if (!req.body.title.trim().length) {
                req.session.errorMsg = 'Tên sản phẩm không được rỗng!';
                return res.redirect('/products/create_new');
            }
            
            if (isNaN(req.body.price)) {
                req.session.errorMsg = 'Giá sản phẩm phải là một số!';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.price) < 0) {
                req.session.errorMsg = 'Giá sản phẩm phải là một số và lớn hơn hoặc bằng 0!';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.province) === 0) {
                req.session.errorMsg = 'Vui lòng chọn tỉnh / thành phố';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.district) === 0) {
                req.session.errorMsg = 'Vui lòng chọn quận / huyện / thị xã';
                return res.redirect('/products/create_new');
            }

            if (Number(req.body.ward) === 0) {
                req.session.errorMsg = 'Vui lòng chọn xã / phường / thị trấn';
                return res.redirect('/products/create_new');
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
                createdAt: Date.now()
            };
            
            const newProduct = await Product.create(product);

            req.session.successMsg = 'Cập nhật hình ảnh cho sản phẩm. Lưu ý: tối đa 4 hình ảnh được cho phép trên 01 sản phẩm!';
            res.render('product/createNewUploadImages', { product_id: newProduct._id, product_title: newProduct.title });

        } catch (error) {
            req.session.errorMsg = 'Có lỗi xảy ra trong quá trình đăng sản phẩm, xin vui lòng thử lại!';
            return res.redirect('/products/create_new');
        } 
    },

    async postCreateNewProductImages(req, res, next) {
        try {
            const product = await Product.findById(req.params.product_id);

            if (!product) {
                req.session.errorMsg = 'Có lỗi xảy ra trong quá trình cập nhật hình ảnh sản phẩm, bạn có thể chỉnh sửa sản phẩm để thêm hình ảnh!';
                return res.redirect('/products');
            }

            if (req.files && req.files.length) {
                for (const file of req.files) {
                    if (!file.mimetype.startsWith('image')) {
                        req.session.errorMsg = 'Có vẻ như tập tin tải lên không phải là hình ảnh, bạn có thể chỉnh sửa sản phẩm để thêm hình ảnh!';
                        return res.redirect(`/products/${req.params.product_id}`);
                    }
                }

                for (const img of req.files) {
                    const uploaded = await cloudinary.uploader.upload(img.path);
                    
                    product.images.push({
                        secure_url: uploaded.secure_url,
                        public_id: uploaded.public_id,
                    });
                }

                await product.save();

                req.session.successMsg = 'Thêm sản phẩm thành công!';
                return res.redirect(`/products/${req.params.product_id}`);
            }
        } catch (error) {
            req.session.errorMsg = 'Rất tiếc, đã có lỗi xảy ra, bạn có thể chỉnh sửa sản phẩm để thêm hình ảnh!';
            return res.redirect(`/products/${req.params.product_id}`);            
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

            const reviewsPaginate = await Review.paginate({
                productId: product.id,
            }, {
                sort: { _id: -1 },
                limit: 5,
                page: req.query.reviews_page || 1,
                populate: {
                    path: 'creator'
                }
            })
            
            res.render('product/showSingle', { product, reviewsPaginate });
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
                req.session.errorMsg = 'Xin lỗi, chúng tôi không thể tìm sản phẩm!';
                return res.render('error/index');
            }

            if (!req.body.title.trim().length) {
                req.session.errorMsg = 'Tên sản phẩm không được rỗng!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }
            
            if (isNaN(req.body.price)) {
                req.session.errorMsg = 'Giá phải là một số!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.price) < 0) {
                req.session.errorMsg = 'Giá phải lớn hơn hoặc bằng 0!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.province) === 0) {
                req.session.errorMsg = 'Vui lòng chọn tỉnh / thành phố nơi bạn sống!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.district) === 0) {
                req.session.errorMsg = 'Vui lòng chọn quận / huyện / thị xã nơi bạn sống!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (Number(req.body.ward) === 0) {
                req.session.errorMsg = 'Vui lòng chọn xã / phường / thị trấn nơi bạn sống!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            if (req.files && req.files.length) {
                for (const file of req.files) {
                    if (!file.mimetype.startsWith('image')) {
                        req.session.errorMsg = 'Tập tin có vẻ như không phải định dạng hình ảnh, vui lòng kiểm tra lại!';
                        return res.redirect(`/products/${req.params.product_id}/edit`);
                    }
                }
            }

            const deletedImagesLength = req.body.deletedImages ? req.body.deletedImages.length : 0;
            const newImagesLength = req.files ? req.files.length : 0;
            const currentImagesLength = product.images.length || 0;
            
            if (currentImagesLength - deletedImagesLength + newImagesLength > 4) {
                req.session.errorMsg = 'Xin lỗi, bạn chỉ có thể tải lên tối đa 4 hình trên một sản phẩm, bao gồm cả hình hiện tại!';
                return res.redirect(`/products/${req.params.product_id}/edit`);
            }

            product.title = striptags(req.body.title.trim());
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
            req.session.successMsg = 'Cập nhật sản phẩm thành công!';
            return res.redirect(`/products/${product.id}`);
        } catch (error) {
            req.session.errorMsg = 'Có lỗi xảy ra, vui lòng thử lại!';
            return res.redirect(`/products/${req.params.product_id}/edit`);
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
            if (req.query._cross_page && req.query._cross_page === 'none') {
                return res.json({
                    ok: true,
                    deleted: true,
                })
            } 

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
                limit: 25,
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
    },

    async deleteManyPosts(req, res, next) {
        try {
            await Product.deleteMany({
                _id: { $in: req.body.deleteManyCheckbox }
            })

            req.session.successMsg = `Xóa thành công ${req.body.deleteManyCheckbox.length} sản phẩm`;
            return res.redirect('/dashboard/products?page=1');
        } catch (error) {
            req.session.errorMsg = 'Có lỗi xảy ra trong quá trình xóa, xin vui lòng thử lại!';
            return res.redirect('/dashboard/products?page=1');
        }
    }
}