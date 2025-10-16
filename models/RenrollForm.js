const mongoose = require("mongoose");

const renrollFormSchema = new mongoose.Schema({
  // Student Information
  childFirstName: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  childLastName: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  gender: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
    enum: ["male", "female"],
  },
  dateOfBirth: {
    type: Date,
    required: function () {
      return this.isCompleted;
    },
  },
  ethnicity: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  gradeLevel: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  hasAdditionalChildren: { type: String, enum: ["yes", "no"] },
  numberOfChildren: { type: Number },

  // Address
  address1: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  address2: String,
  city: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  state: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  zipCode: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  schoolDistrict: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },

  // Father's Information
  fatherFirstName: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  fatherLastName: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  fatherPhone: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  fatherEmail: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  fatherAddress1: String,
  fatherAddress2: String,
  fatherCity: String,
  fatherState: String,
  fatherZipCode: String,
  fatherOccupation: String,
  fatherEmployment: String,

  // Mother's Information
  motherFirstName: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  motherLastName: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  motherPhone: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  motherEmail: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  isMotherAddressSame: { type: String, enum: ["yes", "no"] },
  motherAddress1: String,
  motherAddress2: String,
  motherCity: String,
  motherState: String,
  motherZipCode: String,
  motherOccupation: String,
  motherEmployment: String,

  // Health Changes
  child1HealthChanges: { type: String, enum: ["yes", "no"] },
  child2HealthChanges: { type: String, enum: ["yes", "no"] },
  child3HealthChanges: { type: String, enum: ["yes", "no"] },
  child4HealthChanges: { type: String, enum: ["yes", "no"] },
  child5HealthChanges: { type: String, enum: ["yes", "no"] },

  // Emergency Contacts
  emergency1Name: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  emergency1Phone: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  emergency1Relationship: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  emergency2Name: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  emergency2Phone: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  emergency2Relationship: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  emergency3Name: String,
  emergency3Phone: String,
  emergency3Relationship: String,

  // Authorized Pickup Persons
  authorizedPerson1: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  authorizedPerson1Phone: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  authorizedPerson1Relationship: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  authorizedPerson2: String,
  authorizedPerson2Phone: String,
  authorizedPerson2Relationship: String,
  authorizedPerson3: String,
  authorizedPerson3Phone: String,
  authorizedPerson3Relationship: String,

  // Hospital Preference
  hospitalPreference: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },

  // Parent Signature
  parentSignature: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },

  // Tuition Contract
  guardianName: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  guardianName2: String,
  homePhone: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  guardianEmail: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  acknowledgeTuition: {
    type: String,
    enum: ["", "yes", "no"],
    required: function () {
      return this.isCompleted;
    },
  },
  acknowledgeTextbookFee: {
    type: String,
    enum: ["", "yes", "no"],
    required: function () {
      return this.isCompleted;
    },
  },
  paymentOption: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },
  tuitionSignature: {
    type: String,
    required: function () {
      return this.isCompleted;
    },
  },

  // Status tracking
  currentStep: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RenrollForm", renrollFormSchema);
