const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const passportJWT = require('passport-jwt');
const config = require('../config');

const createAuthToken = user => {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const router = express.Router();

router.post(
    '/login',
    (req, res) => {
      passport.authenticate('jwt', async (err, user, info) => {
        console.log('inside console log');
      });
        // const authToken = createAuthToken(req.user.apiRepr());
        // res.json({authToken});
    }
);

router.post(
    '/refresh',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        const authToken = createAuthToken(req.user);
        res.json({authToken});
    }
);

module.exports = router;

// localStorage.setItem('token', data.authToken);
