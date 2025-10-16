const mongoose = require('mongoose');

const staffSurveySchema = new mongoose.Schema({
  // Staff Information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['teacher', 'administrator', 'support-staff', 'counselor', 'other'],
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },

  // Survey Responses
  workplaceEnvironment: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  trainingOpportunities: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  managementSupport: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  teachingResources: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  communication: {
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

module.exports = mongoose.model('StaffSurvey', staffSurveySchema);
