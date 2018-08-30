const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  practice: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true }
});

schema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

schema.methods.apiRepr = function () {
  const obj = this.toObject();
  const repr = { id: this._id };
  Object.keys(obj).forEach(key => {
    if (!['_id', '__v'].includes(key)) {
      Object.assign(repr, { [key]: obj[key] });
    }
  });

  return repr;
};

const Doctor = mongoose.model('Doctor', schema, 'Doctor');

module.exports = Doctor;
