const mongoose = require('mongoose');
const DoctorSchema = require('mongoose').model('Doctor').schema;
const PatientSchema = require('mongoose').model('Patient').schema;

const schema = mongoose.Schema({
  date: { type: Date, required: true },
  patient: [PatientSchema],
  doctor: [DoctorSchema],
  reason: { type: String, required: true }
});

schema.methods.apiRepr = () => {
  const repr = { id: this._id };
  Object.keys(this).forEach(key => {
    if (key !== '_id') {
      Object.assign(repr, { [key]: this[key] });
    }
  });
  return repr;
}

const Appointment = mongoose.model('Appointment', schema);

module.exports = Appointment;
