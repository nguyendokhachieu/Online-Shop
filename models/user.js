const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    image: {
        secure_url: {
            type: String,
            default: '/images/default-avatar.png',
        },
        public_id: String,
    },
    isMail: {
        type: Number,
        default: 0,
    },
    name: {
        type: String
    },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String, 
    resetPasswordExpires: Date,
    isGoogle: {
        type: Number,
        default: 0,
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);