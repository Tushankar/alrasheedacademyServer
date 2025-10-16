const mongoose = require('mongoose');

const studentSurveySchema = new mongoose.Schema({
  // Student Information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  grade: {
    type: String,
    required: true,
    enum: ['pre-k', 'kindergarten', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  },
  section: {
    type: String,
    required: true,
    enum: ['k3', 'boys', 'girls'],
  },

  // Survey Responses
  teachingQuality: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  academicSupport: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  campusFacilities: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  activities: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  grievanceMechanisms: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  learningEnvironment: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  suggestions: {
    type: String,
    trim: true,
  },

  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudentSurvey', studentSurveySchema);
