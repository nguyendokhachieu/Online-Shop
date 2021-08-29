const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: {
        province: String,
        district: String,
        ward: String,
    },
    geoJSON: Object,
    images: [
        {
            secure_url: String,
            public_id: String,
        }
    ],
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
});

ProductSchema.plugin(mongoosePaginate);

ProductSchema.index({ 
  title: 'text', 
  description: 'text', 
  location: {
    province: 'text',
    district: 'text',
    ward: 'text'
  }
});

module.exports = new mongoose.model('Product', ProductSchema);

/*
    {
  id: 'locality.15107473610875860',
  type: 'Feature',
  place_type: [ 'locality' ],
  relevance: 0.983704,
  properties: {},
  text: 'Phường 13',
  place_name: 'Phường 13, Quận Phú Nhuận, Ho Chi Minh City, Vietnam',
  matching_place_name: 'Phường 13, Quận Phú Nhuận, Thành phố Hồ Chí Minh, Vietnam',
  bbox: [
    106.668075561523,
    10.7879009246827,
    106.673896789551,
    10.7918481826783
  ],
  center: [ 106.67, 10.79 ],
  geometry: { type: 'Point', coordinates: [ 106.67, 10.79 ] },
  context: [
    { id: 'place.15848702084622540', text: 'Quận Phú Nhuận' },
    {
      id: 'region.10003062871057210',
      wikidata: 'Q1854',
      short_code: 'VN-SG',
      text: 'Ho Chi Minh City'
    },
    {
      id: 'country.9472354165536500',
      wikidata: 'Q881',
      short_code: 'vn',
      text: 'Vietnam'
    }
  ]
}

*/