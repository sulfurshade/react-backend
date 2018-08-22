const jwt = require('jsonwebtoken');
const config = require('../config');

function authorizeUser(req, res, next) {
  console.log('inside authorizeUser');
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Invalid credentials" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, config.JWT_SECRET, function(err, decodedUser){
    if (err) {
      console.log('there was an error', err);
      return res.status(401).send({ message: "Invalid credentials" });
    }
    else {
      console.log('User ID:', decodedUser.id);
      next();
    }
  });
}

module.exports = authorizeUser;
