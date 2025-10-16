const mongoose = require("mongoose");

const pictureAuthorizationSchema = new mongoose.Schema({
  // Enrollment ID to link all forms
  enrollmentId: {
    type: String,
    required: true,
    index: true,
  },

  // Picture Authorization
  pictureAuthSignature: { type: String, required: true },

  // Discipline Acknowledgment
  disciplineAcknowledgment: { type: String, required: true },
  signerRole: { type: String, enum: ["Parent", "Guardian"], required: true },
  disciplineFormSignature: { type: String, required: true },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "PictureAuthorization",
  pictureAuthorizationSchema
);
