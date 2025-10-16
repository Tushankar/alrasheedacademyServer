const mongoose = require("mongoose");

const healthFormSchema = new mongoose.Schema({
  // Enrollment ID to link all forms
  enrollmentId: {
    type: String,
    required: true,
    index: true,
  },

  // Insurance & Physician
  insuranceCompany: { type: String, required: true },
  physicianName: { type: String, required: true },
  physicianNumber: { type: String, required: true },

  // Disabilities
  hasDisabilities: { type: String, enum: ["Yes", "No"], default: "No" },
  disabilityExplanation: String,

  // Medical Conditions (checkboxes)
  medicalConditions: {
    asthma: { type: Boolean, default: false },
    diabetes: { type: Boolean, default: false },
    convulsion: { type: Boolean, default: false },
    heartTrouble: { type: Boolean, default: false },
    frequentCold: { type: Boolean, default: false },
    stomachUpsets: { type: Boolean, default: false },
    faintingSpells: { type: Boolean, default: false },
    urinaryProblems: { type: Boolean, default: false },
    skinRash: { type: Boolean, default: false },
    soiling: { type: Boolean, default: false },
    soreThroats: { type: Boolean, default: false },
    earInfection: { type: Boolean, default: false },
    noneOfAbove: { type: Boolean, default: false },
  },

  // Past Diseases (checkboxes)
  pastDiseases: {
    mumps: { type: Boolean, default: false },
    chickenpox: { type: Boolean, default: false },
    hepatitis: { type: Boolean, default: false },
    scarletFever: { type: Boolean, default: false },
    tuberculosis: { type: Boolean, default: false },
    measles: { type: Boolean, default: false },
    noneOfAbove: { type: Boolean, default: false },
  },

  // Additional Past Conditions
  pastConditions: String,

  // Medication
  takesRegularMedication: { type: String, enum: ["Yes", "No"], default: "No" },
  medicationExplanation: String,

  // Allergies
  hasAllergies: { type: String, enum: ["Yes", "No"], default: "No" },
  allergiesList: String,

  // Signature
  healthFormSignature: { type: String, required: true },

  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HealthForm", healthFormSchema);
