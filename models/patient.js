const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  age: { type: Number, required: true},
  gender: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true }
});

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

const Patient = mongoose.model('Patient', schema, 'Patient');

module.exports = Patient;
