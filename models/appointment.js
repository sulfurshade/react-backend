const mongoose = require('mongoose');
const DoctorSchema = require('mongoose').model('Doctor').schema;
const PatientSchema = require('mongoose').model('Patient').schema;

const schema = mongoose.Schema({
  date: { type: Date, required: true },
  patient: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }],
  doctor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }],
  reason: { type: String, required: true }
});

schema.methods.apiRepr = function() {
  const obj = this.toObject();
  const payload = {
    date: this.date,
    patient: this.patient,
    doctor: this.doctor,
    reason: this.reason
  };
  return payload;
}

const Appointment = mongoose.model('Appointment', schema, 'Appointment');

module.exports = Appointment;
