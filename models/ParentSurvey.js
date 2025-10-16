const mongoose = require('mongoose');

const parentSurveySchema = new mongoose.Schema({
  // Parent Information
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
    enum: ['father', 'mother', 'guardian', 'other'],
  },
  studentGrade: {
    type: String,
    required: true,
    trim: true,
  },

  // Survey Responses
  educationQuality: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  communication: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  safetyMeasures: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  activities: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  facilities: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'poor', 'very-poor'],
  },
  admissionsFees: {
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

module.exports = mongoose.model('ParentSurvey', parentSurveySchema);
