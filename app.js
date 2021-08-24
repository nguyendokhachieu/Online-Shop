require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const engine = require('ejs-mate');
const expressSession = require("express-session");
const { connect } = require('./models/connection');
const User = require('./models/user');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require('method-override')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');

const app = express();

app.use(connect);
app.use(methodOverride('_method'));

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
    secure: false,
  }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.errorMsg = req.session.errorMsg || '';
  delete req.session.errorMsg;
  res.locals.successMsg = req.session.successMsg || '';

  res.locals.currentUser = req.user || null;
  
  next();
});

// ================= ROUTES =================
app.use('/products', productsRouter);
app.use('/user', usersRouter);
app.use('/', indexRouter);

// ================= ERROR HANDLERS =================
app.use((req, res, next) => res.render('error/index'));

module.exports = app;