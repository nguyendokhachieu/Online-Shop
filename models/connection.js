const mongoose = require('mongoose');

module.exports = {
    async connect(req, res, next) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, { 
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
            });

            if (mongoose.connection.readyState === 1) return next();
            else return res.render('error/index');
            
        } catch (error) {
            return res.render('error/index');
        }
    }
}