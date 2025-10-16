const express = require("express");
const router = express.Router();

// Import the RenrollForm model
const RenrollForm = require("../models/RenrollForm");

// Validation functions for each step
const validateStep1 = (data) => {
  const errors = [];

  if (!data.childFirstName?.trim()) errors.push("Child first name is required");
  if (!data.childLastName?.trim()) errors.push("Child last name is required");
  if (!data.gender) errors.push("Gender is required");
  if (!data.dateOfBirth) errors.push("Date of birth is required");
  if (!data.ethnicity?.trim()) errors.push("Ethnicity is required");
  if (!data.gradeLevel) errors.push("Grade level is required");
  if (!data.address1?.trim()) errors.push("Address is required");
  if (!data.city?.trim()) errors.push("City is required");
  if (!data.state) errors.push("State is required");
  if (!data.zipCode?.trim()) errors.push("Zip code is required");
  if (!data.schoolDistrict?.trim()) errors.push("School district is required");

  // Parent information validation
  if (!data.fatherFirstName?.trim())
    errors.push("Father first name is required");
  if (!data.fatherLastName?.trim()) errors.push("Father last name is required");
  if (!data.fatherPhone?.trim()) errors.push("Father phone is required");
  if (!data.fatherEmail?.trim()) errors.push("Father email is required");

  if (!data.motherFirstName?.trim())
    errors.push("Mother first name is required");
  if (!data.motherLastName?.trim()) errors.push("Mother last name is required");
  if (!data.motherPhone?.trim()) errors.push("Mother phone is required");
  if (!data.motherEmail?.trim()) errors.push("Mother email is required");

  return errors;
};

const validateStep2 = (data) => {
  const errors = [];

  if (!data.emergency1Name?.trim())
    errors.push("Emergency contact 1 name is required");
  if (!data.emergency1Phone?.trim())
    errors.push("Emergency contact 1 phone is required");
  if (!data.emergency1Relationship?.trim())
    errors.push("Emergency contact 1 relationship is required");

  if (!data.emergency2Name?.trim())
    errors.push("Emergency contact 2 name is required");
  if (!data.emergency2Phone?.trim())
    errors.push("Emergency contact 2 phone is required");
  if (!data.emergency2Relationship?.trim())
    errors.push("Emergency contact 2 relationship is required");

  if (!data.authorizedPerson1?.trim())
    errors.push("Authorized person 1 name is required");
  if (!data.authorizedPerson1Phone?.trim())
    errors.push("Authorized person 1 phone is required");
  if (!data.authorizedPerson1Relationship?.trim())
    errors.push("Authorized person 1 relationship is required");

  if (!data.hospitalPreference?.trim())
    errors.push("Hospital preference is required");
  if (!data.parentSignature?.trim())
    errors.push("Parent signature is required");

  return errors;
};

const validateStep3 = (data) => {
  const errors = [];

  if (!data.guardianName?.trim()) errors.push("Guardian name is required");
  if (!data.homePhone?.trim()) errors.push("Home phone is required");
  if (!data.guardianEmail?.trim()) errors.push("Guardian email is required");
  if (data.acknowledgeTuition !== "yes")
    errors.push("Tuition acknowledgment is required");
  if (data.acknowledgeTextbookFee !== "yes")
    errors.push("Textbook fee acknowledgment is required");
  if (!data.paymentOption) errors.push("Payment option is required");
  if (!data.tuitionSignature?.trim())
    errors.push("Tuition signature is required");

  return errors;
};

// ==================== RENROLL FORM ROUTES ====================

// Create/Save Renroll Form (for each step)
router.post("/renroll-form", async (req, res) => {
  try {
    const formData = req.body;
    const step = formData.currentStep || 0;

    // Validate current step
    let validationErrors = [];
    switch (step) {
      case 0:
        validationErrors = validateStep1(formData);
        break;
      case 1:
        validationErrors = validateStep2(formData);
        break;
      case 2:
        validationErrors = validateStep3(formData);
        break;
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Check if form already exists (by some unique identifier like email + child name)
    let existingForm = await RenrollForm.findOne({
      fatherEmail: formData.fatherEmail,
      childFirstName: formData.childFirstName,
      childLastName: formData.childLastName,
    });

    if (existingForm) {
      // Update existing form
      Object.assign(existingForm, formData);
      existingForm.currentStep = step;
      if (step === 2) {
        existingForm.isCompleted = true;
      }
      await existingForm.save();

      res.json({
        success: true,
        message:
          step === 2
            ? "Renroll form completed successfully!"
            : `Step ${step + 1} saved successfully`,
        form: existingForm,
        canProceed: step < 2,
      });
    } else {
      // Create new form
      const newForm = new RenrollForm({
        ...formData,
        currentStep: step,
        isCompleted: step === 2,
      });
      await newForm.save();

      res.status(201).json({
        success: true,
        message:
          step === 2
            ? "Renroll form completed successfully!"
            : `Step ${step + 1} saved successfully`,
        form: newForm,
        canProceed: step < 2,
      });
    }
  } catch (error) {
    console.error("Error saving renroll form:", error);
    res.status(400).json({
      success: false,
      message: "Failed to save renroll form",
      error: error.message,
    });
  }
});

// Validate step before proceeding
router.post("/renroll-form/validate-step", async (req, res) => {
  try {
    const { step, formData } = req.body;

    let validationErrors = [];
    switch (step) {
      case 0:
        validationErrors = validateStep1(formData);
        break;
      case 1:
        validationErrors = validateStep2(formData);
        break;
      case 2:
        validationErrors = validateStep3(formData);
        break;
    }

    res.json({
      success: validationErrors.length === 0,
      errors: validationErrors,
      canProceed: validationErrors.length === 0,
    });
  } catch (error) {
    console.error("Error validating step:", error);
    res.status(500).json({
      success: false,
      message: "Validation failed",
      error: error.message,
    });
  }
});

// Get all renroll forms
router.get("/renroll-form", async (req, res) => {
  try {
    const forms = await RenrollForm.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      count: forms.length,
      forms,
    });
  } catch (error) {
    console.error("Error fetching renroll forms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch renroll forms",
      error: error.message,
    });
  }
});

// Get single renroll form
router.get("/renroll-form/:id", async (req, res) => {
  try {
    const form = await RenrollForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Renroll form not found",
      });
    }
    res.json({
      success: true,
      form,
    });
  } catch (error) {
    console.error("Error fetching renroll form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch renroll form",
      error: error.message,
    });
  }
});

// Delete renroll form
router.delete("/renroll-form/:id", async (req, res) => {
  try {
    const form = await RenrollForm.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Renroll form not found",
      });
    }
    res.json({
      success: true,
      message: "Renroll form deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting renroll form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete renroll form",
      error: error.message,
    });
  }
});

module.exports = router;
