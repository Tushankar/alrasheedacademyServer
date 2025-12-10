const mongoose = require("mongoose");

const studentRegistrationSchema = new mongoose.Schema({
  // Enrollment ID to link all forms
  enrollmentId: {
    type: String,
    required: true,
    index: true,
  },

  // Student Basic Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gradeLevel: { type: String, required: true },

  // Address
  houseNumber: String,
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },

  // Demographics
  citizenship: String,
  ethnicity: String,

  // Father Information
  fatherFirstName: String,
  fatherLastName: String,
  fatherAddress1: String,
  fatherAddress2: String,
  fatherCity: String,
  fatherState: String,
  fatherZip: String,
  fatherPhone: String,
  fatherEmail: String,
  fatherOccupation: String,
  fatherEmployment: String,
  fatherWorkPhone: String,

  // Mother Information
  motherFirstName: String,
  motherLastName: String,
  motherAddress1: String,
  motherAddress2: String,
  motherCity: String,
  motherState: String,
  motherZip: String,
  motherPhone: String,
  motherEmail: String,
  motherOccupation: String,
  motherEmployment: String,

  // School Information
  publicSchoolName: String,
  publicDistrict: String,
  previousSchoolName: String,
  previousSchoolPhone: String,
  previousSchoolAddress: String,
  reasonForLeaving: String,
  repeatedGrade: String,
  disciplinaryAction: String,

  // Academic Information
  subjectsExcel: String,
  subjectsStruggle: String,
  extracurricularActivities: String,

  // Siblings
  siblings: [
    {
      name: String,
      grade: String,
    },
  ],

  // Photo
  studentPhoto: String, // Path to uploaded photo file

  // Signature
  printName: String,

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "StudentRegistration",
  studentRegistrationSchema
);
