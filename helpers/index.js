const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dnsf5vuyu',
    api_key: '697622647932797',
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports = {
    cloudinary,
    sgMail,
    hideEmail(email) {
        const arr = email.split('@');
        return `${arr[0].substr(0, Math.round(arr[0].length/2))}*****************@${arr[1]}`;
    },
    async geocoding(location) {
        try {
            const response = await geocodingClient.forwardGeocode({
                query: location,
                limit: 1
            }).send();
    
            return response.body.features[0];
        } catch (error) {
            return {};
        }
    }
}