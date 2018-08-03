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
var doctorsRouter = require('./routes/doctors-router');
var patientsRouter = require('./routes/patients-router');
var conditionsRouter = require('./routes/conditions-router');
var appointmentsRouter = require('./routes/appointments-router');
var adminsRouter = require('./routes/admin-router');

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
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/doctors', doctorsRouter);
app.use('/patients', patientsRouter);
app.use('/conditions', conditionsRouter);
app.use('/appointments', appointmentsRouter);
app.use('/admins', adminsRouter);

passport.use(new JsonStrategy(
  function(username, password, done) {
    console.log('console log', username);
    // Doctor.create({name: 'dr app js', number: '1231231234', practice: 'doctor', username: 'appjsdoctor', password: 'appjsdoctor', email: 'appjs@gmail.com'});
    console.log('after doctor create');
    Doctor.findOne({ username: username }, function(err, doctor) {
      console.log('doctor find one');
      if (err) {
        console.log('inside if');
        return done(err);
      }
      console.log('valid password doctor');
      console.log(doctor.validPassword);
      if (doctor.validPassword(password)) {
        console.log('inside valid password');
        return done(null, doctor);
      }
    });

    // Patient.findOne({ username: username }, function(err, user) {
    //   if (err) {
    //     return done(err);
    //   }
    //   console.log("inside patient", user);
    //   if (user.validPassword(password)) {
    //     return done(null, user);
    //   }
    // });

//     Admin.findOne({ username: username }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (user.validPassword(password)) {
//         return done(null, user);
//       }
//     });
//     console.log("can we see this");
//     return done(null, false, {message: 'Could not find user with that email'})
  }
));

app.post('/login', function(req, res, next) {
  passport.authenticate('json', { failureFlash: "this is a string" }, function(err, user) {
    console.log("post login");
  });
});

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
