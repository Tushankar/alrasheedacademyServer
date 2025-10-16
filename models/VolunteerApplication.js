const mongoose = require('mongoose');

const volunteerApplicationSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  // Address Information
  address1: {
    type: String,
    required: true,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zip: {
    type: String,
    required: true,
    trim: true,
  },

  // Volunteer Information
  position: {
    type: String,
    trim: true,
  },

  // Email History
  emails: [{
    to: String,
    subject: String,
    message: String,
    sentAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Application Status
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending',
  },

  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
volunteerApplicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VolunteerApplication', volunteerApplicationSchema);
