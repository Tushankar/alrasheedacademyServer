const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema({
  // Enrollment ID to link all forms
  enrollmentId: {
    type: String,
    required: true,
    index: true,
  },

  // Emergency Contact 1
  emergencyContact1Name: { type: String, required: true },
  emergencyContact1Phone: { type: String, required: true },
  emergencyContact1Relationship: { type: String, required: true },

  // Emergency Contact 2
  emergencyContact2Name: { type: String, required: true },
  emergencyContact2Phone: { type: String, required: true },
  emergencyContact2Relationship: { type: String, required: true },

  // Emergency Contact 3 (Optional)
  emergencyContact3Name: String,
  emergencyContact3Phone: String,
  emergencyContact3Relationship: String,

  // Pediatrician Information
  pediatricianName: String,
  pediatricianPhone: String,

  // Medical Authorization
  hospitalChoice: String,

  // Authorized Pickup
  authorizedPickup: String,

  // Signature
  emergencyFormSignature: { type: String, required: true },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);
