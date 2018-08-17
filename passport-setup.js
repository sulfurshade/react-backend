const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const config = require('./config');
const passport = require('passport');

const Doctor = require('./models/doctor');

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : config.JWT_SECRET
    },
    function (jwtPayload, cb) {
      console.log('inside passport setup function');

        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return Doctor.findOneById(jwtPayload.id)
            .then(user => {
              console.log('passport setup find one');
                return cb(null, user);
            })
            .catch(err => {
              console.log('passport setup catch err');
                return cb(err);
            });
    }
));
