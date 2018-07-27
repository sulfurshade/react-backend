var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy,
  JsonStrategy = require('passport-json').Strategy;
var flash = require('connect-flash');
var session = require('express-session');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var Doctor = require('./models/doctor');
var Admin = require('./models/admin');
var Patient = require('./models/patient');

var app = express();
app.use(bodyParser.json());

app.use(cookieParser('keyboard cat'));
app.use(session({ cookie: { maxAge: 60000 }, secret: 'randomstring', resave: true, saveUninitialized: true}));
app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

passport.use(new JsonStrategy(
  function(username, password, done) {
    console.log('console log');
    Doctor.findOne({ username: username }, function(err, user) {
      console.log('doctor find one');
      if (err) {
        console.log('inside if');
        return done(err);
      }
      console.log('valid password doctor');
      console.log(user.validPassword);
      if (user.validPassword(password)) {
        return done(null, user);
      }
    });

    Patient.findOne({ username: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (user.validPassword(password)) {
        return done(null, user);
      }
    });

    Admin.findOne({ username: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (user.validPassword(password)) {
        return done(null, user);
      }
    });
    return done(null, false, {message: 'Could not find user with that email'})
  }
));

app.post('/login',
  passport.authenticate('json', { failureFlash: "this is a string" })
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
