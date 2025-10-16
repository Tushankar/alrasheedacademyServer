const express = require('express');
const router = express.Router();
const VolunteerApplication = require('../models/VolunteerApplication');

// @route   POST /api/volunteer-applications
// @desc    Submit a new volunteer application
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      zip,
      position,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !address1 || !city || !state || !zip) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create new volunteer application
    const application = new VolunteerApplication({
      firstName,
      lastName,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      zip,
      position,
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Error submitting volunteer application:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting volunteer application',
      error: error.message,
    });
  }
});

// @route   GET /api/volunteer-applications
// @desc    Get all volunteer applications
// @access  Private (should add authentication)
router.get('/', async (req, res) => {
  try {
    const applications = await VolunteerApplication.find()
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer applications',
      error: error.message,
    });
  }
});

// @route   GET /api/volunteer-applications/:id
// @desc    Get a single volunteer application
// @access  Private (should add authentication)
router.get('/:id', async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer application not found',
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching volunteer application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching volunteer application',
      error: error.message,
    });
  }
});

// @route   PUT /api/volunteer-applications/:id/status
// @desc    Update application status
// @access  Private (should add authentication)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Under Review', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const application = await VolunteerApplication.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer application not found',
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message,
    });
  }
});

// @route   POST /api/volunteer-applications/:id/send-email
// @desc    Send email to volunteer
// @access  Private (should add authentication)
router.post('/:id/send-email', async (req, res) => {
  try {
    const { to, subject, message, applicantName } = req.body;

    // Validate required fields
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message',
      });
    }

    console.log('Volunteer Email request received:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Message:', message);

    // Save email to application's email history
    const application = await VolunteerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer application not found',
      });
    }

    // Initialize emails array if it doesn't exist
    if (!application.emails) {
      application.emails = [];
    }

    // Add email to history
    application.emails.push({
      to,
      subject,
      message,
      sentAt: new Date(),
    });

    await application.save();

    res.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        to,
        subject,
        sentAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message,
    });
  }
});

// @route   GET /api/volunteer-applications/:id/emails
// @desc    Get email history for an application
// @access  Private (should add authentication)
router.get('/:id/emails', async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer application not found',
      });
    }

    res.json({
      success: true,
      emails: application.emails || [],
      count: application.emails ? application.emails.length : 0,
    });
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email history',
      error: error.message,
    });
  }
});

// @route   DELETE /api/volunteer-applications/:id
// @desc    Delete a volunteer application
// @access  Private (should add authentication)
router.delete('/:id', async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer application not found',
      });
    }

    await application.deleteOne();

    res.json({
      success: true,
      message: 'Volunteer application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting volunteer application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting volunteer application',
      error: error.message,
    });
  }
});

module.exports = router;
