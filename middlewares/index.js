
module.exports = {
    isLoggedIn(req, res, next) {
        const url = req.protocol + '://' + req.get('host') + req.originalUrl;

        if(req.isAuthenticated()) return next();
        res.redirect(`/user/login?_continue=${url}`);
    },
}