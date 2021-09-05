const Product = require('../models/product');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  
module.exports = {
    async getIndex(req, res, next) {
        try {
            const productsPaginate = await Product.paginate({}, {
                sort: { _id: -1 },
                limit: 5,
                page: req.query.page || 1,
                populate: {
                    path: 'seller'
                }
            });

            return res.render('home/index', { productsPaginate });
        } catch (error) {
            return res.render('error/index');
        }
        
    },

    async getShowSearchResult(req, res, next) {
        try {
            const unescapedQuery = req.query.q ? unescape(decodeURIComponent(req.query.q)) : null;
            const minPrice = req.query.minPrice || null;
            const maxPrice = req.query.maxPrice || null;

            const queryArray = [];

            if (unescapedQuery) {
                queryArray.push(
                    {
                        title: { $regex: unescapedQuery, $options: 'i' }
                    },
                    {
                        description: { $regex: unescapedQuery, $options: 'i' }
                    },
                    {
                        'location.province': { $regex: unescapedQuery, $options: 'i' }
                    },
                    {
                        'location.district': { $regex: unescapedQuery, $options: 'i' }
                    },
                    {
                        'location.ward': { $regex: unescapedQuery, $options: 'i' }
                    },
                )
            }

            if (minPrice && maxPrice) {
                queryArray.push(
                    {
                        price: { $gte: minPrice, $lte: maxPrice }
                    }
                )
            } else if (minPrice === null && maxPrice !== null) {
                queryArray.push(
                    {
                        price: { $lte: maxPrice }
                    }
                )
            } else if (minPrice !== null && maxPrice === null) {
                queryArray.push(
                    {
                        price: { $gte: minPrice }
                    }
                )
            }            

            const dbQueries = queryArray.length ? { $or: queryArray } : {};

            const productsPaginate = await Product.paginate(dbQueries, {
                sort: { _id: -1 },
                limit: 5,
                page: req.query.page || 1,
                populate: {
                    path: 'seller'
                }
            });

            res.render('home/search', { productsPaginate, unescapedQuery, minPrice, maxPrice });

        } catch (error) {
            
        }
    },
    
}