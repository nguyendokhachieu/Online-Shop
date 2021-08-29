const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ReviewSchema = new Schema({
    body: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
    },
    createdAt: Date,
});

ReviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Review', ReviewSchema);