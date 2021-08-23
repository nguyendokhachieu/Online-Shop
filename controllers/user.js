
module.exports = {
    getLogin(req, res, next) {
        res.render('user/login');
    },

    getRegister(req, res, next) {
        res.render('user/register');
    }
}