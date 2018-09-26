const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  age: { type: Number, required: true},
  gender: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true }
});

schema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

schema.methods.apiRepr = function () {
  // this = document
  const obj = this.toObject();
  const repr = { id: this._id };

  Object.keys(obj).forEach(key => {
    if (!['_id', 'password', '__v'].includes(key)) {
      Object.assign(repr, { [key]: obj[key] });
    }
  })

  return repr;
}

const Patient = mongoose.model('Patient', schema, 'Patient');

module.exports = Patient;
