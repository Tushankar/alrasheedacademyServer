const mongoose = require("mongoose");

const tuitionContractSchema = new mongoose.Schema({
  // Enrollment ID to link all forms
  enrollmentId: {
    type: String,
    required: true,
    index: true,
  },

  // Guardian Information
  guardianFirstName: { type: String, required: true },
  guardianLastName: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  guardianEmail: { type: String, required: true },

  // Guardian Address
  guardianAddressLine1: { type: String, required: true },
  guardianAddressLine2: String,
  guardianCity: { type: String, required: true },
  guardianState: { type: String, required: true },
  guardianZipCode: { type: String, required: true },

  // Acknowledgments
  tuitionAcknowledgment: { type: String, required: true },
  textbookFeeAcknowledgment: { type: String, required: true },
  applicationFeeAcknowledgment: { type: String, required: true },

  // Payment Options
  paymentOption1: { type: Boolean, default: false }, // Pay in full
  paymentOption2: { type: Boolean, default: false }, // Monthly payments
  paymentOption3: { type: Boolean, default: false }, // Semester payments

  // Signature
  tuitionContractSignature: { type: String, required: true },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TuitionContract", tuitionContractSchema);
