const { cloudinary, sgMail, hideEmail } = require('../helpers');
const crypto = require('crypto');
const User = require('../models/user');

module.exports = {
    getLogin(req, res, next) {
        res.render('user/login');
    },

    getRegister(req, res, next) {
        res.render('user/register');
    },

    getVerificationCheckUp(req, res, next) {
        res.render('user/registerSuccessAndMail');
    },

    async postRegister(req, res, next) {
        try {
            if (req.body.email.trim().length < 6) {
                req.session.errorMsg = 'Invalid email address, please try again!';
                return res.redirect('/user/register');
            }

            if (req.body.username.trim().length < 8) {
                req.session.errorMsg = 'Username requires at least 8 characters. Please choose another!';
                return res.redirect('/user/register');
            }

            if (req.body.password !== req.body.confirmPassword) {
                req.session.errorMsg = 'Password mismatched! Please try again!';
                return res.redirect('/user/register');
            }

            if (req.body.password.trim().length < 8) {
                req.session.errorMsg = 'Password has at least 8 characters, excludes any white spaces!';
                return res.redirect('/user/register');
            }

            const newUser = new User({
                email: req.body.email,
                username: req.body.username,
            });

            const user = await User.register(newUser, req.body.password);

            // xử lý upload không phải hình ảnh
            if (req.file && req.file.path) {
                const uploadImage = await cloudinary.uploader.upload(req.file.path);
                user.image.secure_url = uploadImage.secure_url;
                user.image.public_id = uploadImage.public_id;
            }

            const verificationToken1 = crypto.randomBytes(20).toString('hex');
            const verificationToken2 = crypto.randomBytes(15).toString('hex');

            const linkToVerification = `${req.headers.host}/user/verification/${user.id}/${verificationToken1}?_cross=1&_met=0&bznai=${verificationToken2}`;

            user.verificationToken = verificationToken1;
            user.verificationExpires = Date.now() + (0.5 * 60 * 60 * 1000); // 30 minutes
            await user.save();

            const msg = {
                to: req.body.email,
                from: 'ngdokhachieu@gmail.com', // Use the email address or domain you verified above
                subject: 'Online Shop - Account Verification',
                text: `Please click the following link to verify your mail.`,
                html: `<h2>${linkToVerification}</h2>`,
            };

            await sgMail.send(msg);

            req.session.successMsg = `An email has been sent to ${req.body.email}. Please open your mailbox (make sure to check spams, too) and follow further instructions!`;
            return res.redirect('/user/verification_checkup');
        } catch (error) {
            let errorMessage = error.message;
            if (errorMessage.includes('duplicate')) {
                errorMessage = `${req.body.email} had been used before. Please try again with another email!`; 
            }
            
            req.session.errorMsg = errorMessage;
            return res.redirect('/user/register');
        }
    },

    async getUserVerification(req, res, next) {
        try {
            // currently not consider verificationExpires ===================            
            const user = await User.findOne({
                verificationToken: req.params.verification_token,
            });

            if (!user) {
                req.session.errorMsg = 'We cannot find user. Make sure you clicked the link we sent';
                return res.redirect('/user/register');
            }

            user.isMail = 1;
            user.verificationToken = null;
            user.verificationExpires = null; // 30 minutes
            await user.save();

            req.session.successMsg = 'Successfully verified your account! Please use your registered infomation to login';
            return res.redirect('/user/login');
            
        } catch (error) {
            req.session.errorMsg = 'We cannot find user. Make sure you clicked the link we sent';
            return res.redirect('/user/register');
        }
    },

    async postLogin(req, res, next) {
        try {
            if (req.body.username.trim().length < 8) {
                req.session.errorMsg = 'Username requires at least 8 characters. Please choose another!';
                return res.redirect('/user/login');
            }

            if (req.body.password.trim().length < 8) {
                req.session.errorMsg = 'Password has at least 8 characters, excludes any white spaces!';
                return res.redirect('/user/login');
            }

            const { user, error } = await User.authenticate()(req.body.username, req.body.password);

            if (!user) {
                req.session.errorMsg = 'Invalid username or password!';
                return res.redirect('/user/login');
            }

            if (error) {
                req.session.errorMsg = 'Some unexpected errors appeared when we had tried to log you in! Please login again!' + error.message;
                return res.redirect('/user/login');
            }

            if (user.isMail === 0) {
                req.session.errorMsg = `Please open your mailbox (and spams, too) in the email address you had registered (${hideEmail(user.email)}), then follow further instructions to verify your account!`;
                return res.redirect('/user/login');
            }

            req.login(user, function(err) {
                if (err) {
                    console.log(err);
                    req.session.errorMsg = 'Some unexpected errors appeared when we had tried to log you in! Please login again!';
                    return res.redirect('/user/login');
                }

                req.session.successMsg = `Welcome, ${user.username}`;
                return res.redirect('/');
            })
        } catch (error) {
            req.session.errorMsg = 'Some unexpected errors appeared when we had tried to log you in! Please login again!';
            return res.redirect('/user/login');
        }
    },

    getForgotPassword(req, res, next) {
        res.render('user/forgotPassword');
    }
}