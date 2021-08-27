const { cloudinary, sgMail, hideEmail } = require('../helpers');
const crypto = require('crypto');
const User = require('../models/user');

module.exports = {
    getLogin(req, res, next) {
        if (req.isAuthenticated()) return res.redirect('/');
        res.render('user/login', { _continue: req.query._continue || null });
    },

    getLogout(req, res, next) {
        req.logout();
        req.session.successMsg = 'Logout successfully!';
        res.redirect("/");
    },

    getRegister(req, res, next) {
        if (req.isAuthenticated()) return res.redirect('/');
        res.render('user/register');
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
            return res.render('user/registerSuccessAndMail');
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
                req.session.errorMsg = 'Sorry, we cannot find user!';
                return res.redirect('/user/register');
            }

            user.isMail = 1;
            user.verificationToken = null;
            user.verificationExpires = null; // 30 minutes
            await user.save();

            req.session.successMsg = 'Successfully verified your account! Please use your registered infomation to login';
            return res.redirect('/user/login');
            
        } catch (error) {
            req.session.errorMsg = 'Sorry, we cannot find user!';
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

                const _continue = req.query._continue || null;

                req.session.successMsg = `Welcome, ${user.username}`;
                return res.redirect(_continue || '/');
            })
        } catch (error) {
            req.session.errorMsg = 'Some unexpected errors appeared when we had tried to log you in! Please login again!';
            return res.redirect('/user/login');
        }
    },

    getForgotPassword(req, res, next) {
        if (req.isAuthenticated()) return res.redirect('/');
        res.render('user/forgotPassword');
    },

    async putForgotPassword(req, res, next) {
        try {
            if (req.body.email.trim().length < 6) {
                req.session.errorMsg = 'Invalid email address, please try again!';
                return res.redirect('/user/forgot_password');
            }
            
            const user = await User.findOne({
                email: req.body.email
            });

            if (!user) {
                req.session.errorMsg = 'We cannot find your account! Make sure this is your email, please try again!';
                return res.redirect('/user/forgot_password');
            }

            const resetToken1 = crypto.randomBytes(20).toString('hex');
            const resetToken2 = crypto.randomBytes(20).toString('hex');

            const linkToReset = `${req.headers.host}/user/reset_password/${resetToken1}?_cross=0&_met=1&bznai=${resetToken2}`;

            user.resetPasswordToken = resetToken1;
            user.resetPasswordExpires = Date.now() + (10*60*1000); // 10 minutes
            await user.save();

            const msg = {
                to: req.body.email,
                from: 'ngdokhachieu@gmail.com', // Use the email address or domain you verified above
                subject: 'Online Shop - Password Recovery',
                text: `Please click the following link to recover your password.`,
                html: `<a href="${linkToReset}">${linkToReset}</a>`,
            };

            await sgMail.send(msg);     
            
            req.session.successMsg = 'An email has been sent to you. Please open your mailbox (make sure to check spams, too) and follow further instructions!';
            return res.redirect('/user/forgot_password');
        } catch (error) {
            req.session.errorMsg = 'We cannot find your account! Make sure this is your email, please try again!';
            return res.redirect('/user/forgot_password');
        }
    },

    async getResetPassword(req, res, next) {
        try {
            if (req.isAuthenticated()) return res.redirect('/');
            const user = await User.findOne({
                resetPasswordToken: req.params.reset_password_token,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                req.session.errorMsg = 'We cannot find your account or your link has expired!';
                return res.redirect('/user/forgot_password');
            }

            req.session.successMsg = 'Please type your new password!';
            return res.render('user/passwordRecovery', { reset_password_token: req.params.reset_password_token });
        } catch (error) {
            req.session.errorMsg = 'We cannot find your account or your link has expired!';
            return res.redirect('/user/forgot_password');
        }
    },

    async putPasswordRecovery(req, res, next) {
        try {
            const user = await User.findOne({
                resetPasswordToken: req.params.reset_password_token,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                req.session.errorMsg = 'TryWe cannot find your account or your link has expired!';
                return res.redirect('/user/forgot_password');
            }

            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            if (req.body.password !== req.body.confirmPassword) {
                req.session.errorMsg = 'Password mismatched! Please try again!';
                return res.redirect('/user/forgot_password');
            }

            if (req.body.password.trim().length < 8) {
                req.session.errorMsg = 'Password has at least 8 characters, excludes any white spaces!';
                return res.redirect('/user/forgot_password');
            }

            await user.setPassword(req.body.password);
            await user.save();

            req.login(user, function(err) {
                if (err) {
                    req.session.errorMsg = 'Some unexpected errors happened while we logged you in! Please try to login again!';
                    return res.redirect('/user/login');
                }

                req.session.successMsg = 'Password changed successfully!';
                return res.redirect('/');
            })
        } catch (error) {
            req.session.errorMsg = 'CatchWe cannot find your account or your link has expired!';
            return res.redirect('/user/forgot_password');
        }
    },

    async getShowUserProfile(req, res, next) {
        try {
            const user = await User.findOne({
                username: req.params.username
            });

            if (!user) {
                req.session.errorMsg = 'Cannot find user';
                return res.render('error/index');
            }

            return res.render('user/showProfile', { user });
        } catch (error) {
            req.session.errorMsg = 'Cannot find user';
            return res.render('error/index');
        }
    },

    async patchChangeUserProfileImage(req, res, next) {
        try {
            if (req.file) {
                if (!req.file.mimetype.startsWith('image')) {
                    req.session.errorMsg = 'One or multiple files are not in image format!';
                    return res.redirect(`/user/profile/${req.user.username}`);
                }

                const user = await User.findById(req.user._id);

                if (!user) {
                    req.session.errorMsg = 'Cannot find user!';
                    return res.redirect(`/user/profile/${req.user.username}`);
                }

                if (!user.image.secure_url.includes('/images/default-avatar.png')) {
                    await cloudinary.uploader.destroy(user.image.public_id);
                }

                const uploaded = await cloudinary.uploader.upload(req.file.path);

                user.image.secure_url = uploaded.secure_url;
                user.image.public_id = uploaded.public_id;

                await user.save();

                req.session.successMsg = 'Updated your profile image!';
                return res.redirect(`/user/profile/${req.user.username}`);
            }

            req.session.errorMsg = 'Please choose your profile image!';
            return res.redirect(`/user/profile/${req.user.username}`);
        } catch (error) {
            req.session.errorMsg = 'Some unexpected errors happened';
            return res.redirect(`/user/profile/${req.user.username}`);
        }
    }

}