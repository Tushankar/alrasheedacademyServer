const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say', 'male', 'female', 'other'],
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address1: {
    type: String,
    required: true,
  },
  address2: String,
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },

  // Job Information
  position: {
    type: String,
    required: true,
  },
  hourlyPay: String,
  startDate: String,
  workAuth: {
    type: String,
    enum: ['Yes', 'No', 'yes', 'no'],
  },
  felony: {
    type: String,
    enum: ['Yes', 'No', 'yes', 'no'],
  },

  // Education (Array of schools)
  schools: [{
    schoolName: String,
    schoolType: {
      type: String,
      enum: ['High School', 'College', 'University', 'Trade School', 'Professional School', 'Bus. or Trade School', 'high-school', 'college', 'trade', 'professional', 'Other'],
    },
    location: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    degree: String,
    major: String,
    yearsCompleted: String,
  }],

  // Work Experience (Array)
  workExperience: [{
    company: String,
    phone: String,
    position: String,
    responsibilities: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    duration: String,
    contactForRef: {
      type: String,
      enum: ['Yes', 'No', 'yes', 'no'],
    },
    reasonForLeaving: String,
  }],
  
  // Legacy fields for backward compatibility (kept for old single work experience)
  companyName: String,
  companyPhone: String,
  workPosition: String,
  workDuration: String,
  reasonLeaving: String,
  contactRef: {
    type: String,
    enum: ['Yes', 'No', 'yes', 'no'],
  },

  // References (Array)
  references: [{
    firstName: String,
    lastName: String,
    company: String,
    title: String,
    phone: String,
    email: String,
  }],

  // Files
  resume: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  signature: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
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
jobApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
