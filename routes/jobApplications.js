const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const JobApplication = require('../models/JobApplication');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/job-applications');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow resumes: PDF, DOC, DOCX
  // Allow signatures: PDF, PNG, JPG, JPEG
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PNG, JPG, and JPEG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// @route   POST /api/job-applications
// @desc    Submit a new job application
// @access  Public
router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      schools: req.body.schools ? JSON.parse(req.body.schools) : [],
      workExperience: req.body.workExperience ? JSON.parse(req.body.workExperience) : [],
      references: req.body.references ? JSON.parse(req.body.references) : [],
    };

    // Add resume file info if uploaded
    if (req.files && req.files.resume) {
      const resumeFile = req.files.resume[0];
      applicationData.resume = {
        filename: resumeFile.filename,
        originalName: resumeFile.originalname,
        mimetype: resumeFile.mimetype,
        size: resumeFile.size,
        path: resumeFile.path,
      };
    }

    // Add signature file info if uploaded
    if (req.files && req.files.signature) {
      const signatureFile = req.files.signature[0];
      applicationData.signature = {
        filename: signatureFile.filename,
        originalName: signatureFile.originalname,
        mimetype: signatureFile.mimetype,
        size: signatureFile.size,
        path: signatureFile.path,
      };
    }

    const newApplication = new JobApplication(applicationData);
    await newApplication.save();

    res.status(201).json({
      success: true,
      message: 'Job application submitted successfully',
      application: newApplication,
    });
  } catch (error) {
    console.error('Error creating job application:', error);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      if (req.files.resume) {
        fs.unlinkSync(req.files.resume[0].path);
      }
      if (req.files.signature) {
        fs.unlinkSync(req.files.signature[0].path);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting job application',
      error: error.message,
    });
  }
});

// @route   GET /api/job-applications
// @desc    Get all job applications (for admin)
// @access  Private (should add authentication)
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Search by name, email, or position
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await JobApplication.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job applications',
      error: error.message,
    });
  }
});

// @route   GET /api/job-applications/:id
// @desc    Get a single job application by ID
// @access  Private (should add authentication)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching application with ID:', id);
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
        receivedId: id,
      });
    }
    
    const application = await JobApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Error fetching job application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job application',
      error: error.message,
    });
  }
});

// @route   PUT /api/job-applications/:id/status
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

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
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

// @route   POST /api/job-applications/:id/send-email
// @desc    Send email to applicant
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

    console.log('Email request received:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Message:', message);

    // TODO: Integrate with actual email service (nodemailer, SendGrid, etc.)
    // For now, we'll just log and return success
    
    // Example with nodemailer (uncomment when configured):
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or 'smtp', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'hr@alrasheedacademy.org',
      to: to,
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
               <p style="white-space: pre-line;">${message.replace(/\n/g, '<br>')}</p>
             </div>`,
    };

    await transporter.sendMail(mailOptions);
    */

    // Save email to application's email history
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
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

    // For now, simulate successful email sending
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

// @route   GET /api/job-applications/:id/emails
// @desc    Get email history for an application
// @access  Private (should add authentication)
router.get('/:id/emails', async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
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

// @route   DELETE /api/job-applications/:id
// @desc    Delete a job application
// @access  Private (should add authentication)
router.delete('/:id', async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    // Delete associated files
    if (application.resume && application.resume.path) {
      if (fs.existsSync(application.resume.path)) {
        fs.unlinkSync(application.resume.path);
      }
    }
    if (application.signature && application.signature.path) {
      if (fs.existsSync(application.signature.path)) {
        fs.unlinkSync(application.signature.path);
      }
    }

    await JobApplication.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job application deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job application',
      error: error.message,
    });
  }
});

// @route   GET /api/job-applications/:id/download/:fileType
// @desc    Download resume or signature file
// @access  Private (should add authentication)
router.get('/:id/download/:fileType', async (req, res) => {
  try {
    const { id, fileType } = req.params;
    
    if (!['resume', 'signature'].includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Must be "resume" or "signature"',
      });
    }

    const application = await JobApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    const fileInfo = application[fileType];

    if (!fileInfo || !fileInfo.path) {
      return res.status(404).json({
        success: false,
        message: `${fileType} file not found`,
      });
    }

    if (!fs.existsSync(fileInfo.path)) {
      return res.status(404).json({
        success: false,
        message: `${fileType} file not found on server`,
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', fileInfo.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fileInfo.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message,
    });
  }
});

module.exports = router;
