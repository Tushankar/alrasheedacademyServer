const mongoose = require("mongoose");

const transferRecordsSchema = new mongoose.Schema({
  // Enrollment ID to link all forms
  enrollmentId: {
    type: String,
    required: true,
    index: true,
  },

  // Student Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  grade: { type: String, required: true },

  // Previous School Information
  previousSchoolName: { type: String, required: true },
  previousSchoolAddress: { type: String, required: true },
  previousSchoolCity: { type: String, required: true },
  previousSchoolState: { type: String, required: true },
  previousSchoolZip: { type: String, required: true },
  previousSchoolPhone: { type: String, required: true },

  // Parent/Guardian Information
  parentGuardianName: { type: String, required: true },
  parentGuardianPhone: { type: String, required: true },
  parentGuardianEmail: String,

  // Records Request Details
  recordsNeeded: String,
  urgencyLevel: String,

  // Signature
  transferFormSignature: { type: String, required: true },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TransferRecords", transferRecordsSchema);
