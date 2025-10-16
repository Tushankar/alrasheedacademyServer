const express = require('express');
const router = express.Router();
const ParentSurvey = require('../models/ParentSurvey');
const StaffSurvey = require('../models/StaffSurvey');
const StudentSurvey = require('../models/StudentSurvey');

// ==================== PARENT SURVEYS ====================

// @route   POST /api/surveys/parent
// @desc    Submit a parent survey
// @access  Public
router.post('/parent', async (req, res) => {
  try {
    const survey = new ParentSurvey(req.body);
    await survey.save();

    res.status(201).json({
      success: true,
      message: 'Parent survey submitted successfully',
      survey,
    });
  } catch (error) {
    console.error('Error submitting parent survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting parent survey',
      error: error.message,
    });
  }
});

// @route   GET /api/surveys/parent
// @desc    Get all parent surveys
// @access  Private
router.get('/parent', async (req, res) => {
  try {
    const surveys = await ParentSurvey.find()
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: surveys.length,
      surveys,
    });
  } catch (error) {
    console.error('Error fetching parent surveys:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent surveys',
      error: error.message,
    });
  }
});

// @route   GET /api/surveys/parent/:id
// @desc    Get single parent survey
// @access  Private
router.get('/parent/:id', async (req, res) => {
  try {
    const survey = await ParentSurvey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Parent survey not found',
      });
    }

    res.json({
      success: true,
      survey,
    });
  } catch (error) {
    console.error('Error fetching parent survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent survey',
      error: error.message,
    });
  }
});

// @route   DELETE /api/surveys/parent/:id
// @desc    Delete a parent survey
// @access  Private
router.delete('/parent/:id', async (req, res) => {
  try {
    const survey = await ParentSurvey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Parent survey not found',
      });
    }

    await survey.deleteOne();

    res.json({
      success: true,
      message: 'Parent survey deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting parent survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting parent survey',
      error: error.message,
    });
  }
});

// ==================== STAFF SURVEYS ====================

// @route   POST /api/surveys/staff
// @desc    Submit a staff survey
// @access  Public
router.post('/staff', async (req, res) => {
  try {
    const survey = new StaffSurvey(req.body);
    await survey.save();

    res.status(201).json({
      success: true,
      message: 'Staff survey submitted successfully',
      survey,
    });
  } catch (error) {
    console.error('Error submitting staff survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting staff survey',
      error: error.message,
    });
  }
});

// @route   GET /api/surveys/staff
// @desc    Get all staff surveys
// @access  Private
router.get('/staff', async (req, res) => {
  try {
    const surveys = await StaffSurvey.find()
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: surveys.length,
      surveys,
    });
  } catch (error) {
    console.error('Error fetching staff surveys:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff surveys',
      error: error.message,
    });
  }
});

// @route   GET /api/surveys/staff/:id
// @desc    Get single staff survey
// @access  Private
router.get('/staff/:id', async (req, res) => {
  try {
    const survey = await StaffSurvey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Staff survey not found',
      });
    }

    res.json({
      success: true,
      survey,
    });
  } catch (error) {
    console.error('Error fetching staff survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff survey',
      error: error.message,
    });
  }
});

// @route   DELETE /api/surveys/staff/:id
// @desc    Delete a staff survey
// @access  Private
router.delete('/staff/:id', async (req, res) => {
  try {
    const survey = await StaffSurvey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Staff survey not found',
      });
    }

    await survey.deleteOne();

    res.json({
      success: true,
      message: 'Staff survey deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting staff survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff survey',
      error: error.message,
    });
  }
});

// ==================== STUDENT SURVEYS ====================

// @route   POST /api/surveys/student
// @desc    Submit a student survey
// @access  Public
router.post('/student', async (req, res) => {
  try {
    const survey = new StudentSurvey(req.body);
    await survey.save();

    res.status(201).json({
      success: true,
      message: 'Student survey submitted successfully',
      survey,
    });
  } catch (error) {
    console.error('Error submitting student survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting student survey',
      error: error.message,
    });
  }
});

// @route   GET /api/surveys/student
// @desc    Get all student surveys
// @access  Private
router.get('/student', async (req, res) => {
  try {
    const surveys = await StudentSurvey.find()
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: surveys.length,
      surveys,
    });
  } catch (error) {
    console.error('Error fetching student surveys:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student surveys',
      error: error.message,
    });
  }
});

// @route   GET /api/surveys/student/:id
// @desc    Get single student survey
// @access  Private
router.get('/student/:id', async (req, res) => {
  try {
    const survey = await StudentSurvey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Student survey not found',
      });
    }

    res.json({
      success: true,
      survey,
    });
  } catch (error) {
    console.error('Error fetching student survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student survey',
      error: error.message,
    });
  }
});

// @route   DELETE /api/surveys/student/:id
// @desc    Delete a student survey
// @access  Private
router.delete('/student/:id', async (req, res) => {
  try {
    const survey = await StudentSurvey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Student survey not found',
      });
    }

    await survey.deleteOne();

    res.json({
      success: true,
      message: 'Student survey deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student survey:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student survey',
      error: error.message,
    });
  }
});

module.exports = router;
