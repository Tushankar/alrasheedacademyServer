const mongoose = require("mongoose");

const newEnrollmentSchema = new mongoose.Schema({
  // Enrollment ID
  enrollmentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // Parent Information
  parentFullName: {
    type: String,
    required: true,
  },
  relationshipToStudent: {
    type: String,
    required: true,
  },
  maritalStatus: {
    type: String,
    required: true,
  },
  primaryPhone: {
    type: String,
    required: true,
  },
  alternatePhone: String,
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  alternateEmail: String,
  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },

  // Student Information
  studentFullName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  birthCertificateNIC: String,
  totalSiblings: {
    type: Number,
    default: 0,
  },
  orphanStatus: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
  },
  oscStatus: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
  },
  identificationMark: String,
  registrationNumber: String,
  admissionDate: Date,
  classGrade: String,
  section: String,
  previousSchoolName: String,
  previousSchoolID: String,
  boardRollNumber: String,
  studentEmail: {
    type: String,
    lowercase: true,
  },
  studentPhone: String,
  residentialAddress: String,
  studentPhoto: String, // Path to uploaded photo file

  // Agreement
  agreementSignature: {
    type: String,
    required: true,
  },

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("NewEnrollment", newEnrollmentSchema);
