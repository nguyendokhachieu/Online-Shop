
module.exports = {
    async getDashboardHomePage(req, res, next) {
        try {
            res.render('dashboard/index');
        } catch (error) {
            
        }
    }
    
}