const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dnsf5vuyu',
    api_key: '697622647932797',
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
    cloudinary,
    sgMail,
    hideEmail(email) {
        const arr = email.split('@');
        return `${arr[0].substr(0, Math.round(arr[0].length/2))}*****************@${arr[1]}`;
    }
}