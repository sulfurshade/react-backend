const mongoose = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

schema.methods.apiRepr = function () {
  const obj = this.toObject();
  const repr = { id: this._id };
  Object.keys(obj).forEach(key => {
    if (!['_id', '__v'].includes(key)) {
      Object.assign(repr, { [key]: obj[key] });
    }
  })
  return repr;
}

const Admin = mongoose.model('Admin', schema, 'Admin');

module.exports = Admin;
