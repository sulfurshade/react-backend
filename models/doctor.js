const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  practice: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true }
});

schema.methods.validPassword = function (password) {
  return this.password === password;
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
