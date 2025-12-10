const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/student-photos"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      req.body.enrollmentId +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Forms routes are working!" });
});

// Import all form models
const StudentRegistration = require("../models/StudentRegistration");
const EmergencyContact = require("../models/EmergencyContact");
const HealthForm = require("../models/HealthForm");
const PictureAuthorization = require("../models/PictureAuthorization");
const TransferRecords = require("../models/TransferRecords");
const TuitionContract = require("../models/TuitionContract");
const NewEnrollment = require("../models/NewEnrollment");

// ==================== STUDENT REGISTRATION ROUTES ====================

// Create Student Registration
router.post("/student-registration", async (req, res) => {
  try {
    const registration = new StudentRegistration(req.body);
    await registration.save();
    res.status(201).json({
      success: true,
      message: "Student registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("Error submitting student registration:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit student registration",
      error: error.message,
    });
  }
});

// Get all Student Registrations
router.get("/student-registration", async (req, res) => {
  try {
    const registrations = await StudentRegistration.find().sort({
      submittedAt: -1,
    });
    res.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
      error: error.message,
    });
  }
});

// Get Single Student Registration
router.get("/student-registration/:id", async (req, res) => {
  try {
    const registration = await StudentRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    res.json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("Error fetching registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registration",
      error: error.message,
    });
  }
});

// Delete Student Registration
router.delete("/student-registration/:id", async (req, res) => {
  try {
    const registration = await StudentRegistration.findByIdAndDelete(
      req.params.id
    );
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    res.json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete registration",
      error: error.message,
    });
  }
});

// ==================== EMERGENCY CONTACT ROUTES ====================

// Create Emergency Contact
router.post("/emergency-contact", async (req, res) => {
  try {
    const contact = new EmergencyContact(req.body);
    await contact.save();
    res.status(201).json({
      success: true,
      message: "Emergency contact submitted successfully",
      contact,
    });
  } catch (error) {
    console.error("Error submitting emergency contact:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit emergency contact",
      error: error.message,
    });
  }
});

// Get all Emergency Contacts
router.get("/emergency-contact", async (req, res) => {
  try {
    const contacts = await EmergencyContact.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch emergency contacts",
      error: error.message,
    });
  }
});

// Get Single Emergency Contact
router.get("/emergency-contact/:id", async (req, res) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found",
      });
    }
    res.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Error fetching emergency contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch emergency contact",
      error: error.message,
    });
  }
});

// Delete Emergency Contact
router.delete("/emergency-contact/:id", async (req, res) => {
  try {
    const contact = await EmergencyContact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found",
      });
    }
    res.json({
      success: true,
      message: "Emergency contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete emergency contact",
      error: error.message,
    });
  }
});

// ==================== HEALTH FORM ROUTES ====================

// Create Health Form
router.post("/health-form", async (req, res) => {
  try {
    const healthForm = new HealthForm(req.body);
    await healthForm.save();
    res.status(201).json({
      success: true,
      message: "Health form submitted successfully",
      healthForm,
    });
  } catch (error) {
    console.error("Error submitting health form:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit health form",
      error: error.message,
    });
  }
});

// Get all Health Forms
router.get("/health-form", async (req, res) => {
  try {
    const healthForms = await HealthForm.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      count: healthForms.length,
      healthForms,
    });
  } catch (error) {
    console.error("Error fetching health forms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch health forms",
      error: error.message,
    });
  }
});

// Get Single Health Form
router.get("/health-form/:id", async (req, res) => {
  try {
    const healthForm = await HealthForm.findById(req.params.id);
    if (!healthForm) {
      return res.status(404).json({
        success: false,
        message: "Health form not found",
      });
    }
    res.json({
      success: true,
      healthForm,
    });
  } catch (error) {
    console.error("Error fetching health form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch health form",
      error: error.message,
    });
  }
});

// Delete Health Form
router.delete("/health-form/:id", async (req, res) => {
  try {
    const healthForm = await HealthForm.findByIdAndDelete(req.params.id);
    if (!healthForm) {
      return res.status(404).json({
        success: false,
        message: "Health form not found",
      });
    }
    res.json({
      success: true,
      message: "Health form deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting health form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete health form",
      error: error.message,
    });
  }
});

// ==================== PICTURE AUTHORIZATION ROUTES ====================

// Create Picture Authorization
router.post("/picture-authorization", async (req, res) => {
  try {
    const authorization = new PictureAuthorization(req.body);
    await authorization.save();
    res.status(201).json({
      success: true,
      message: "Picture authorization submitted successfully",
      authorization,
    });
  } catch (error) {
    console.error("Error submitting picture authorization:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit picture authorization",
      error: error.message,
    });
  }
});

// Get all Picture Authorizations
router.get("/picture-authorization", async (req, res) => {
  try {
    const authorizations = await PictureAuthorization.find().sort({
      submittedAt: -1,
    });
    res.json({
      success: true,
      count: authorizations.length,
      authorizations,
    });
  } catch (error) {
    console.error("Error fetching picture authorizations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch picture authorizations",
      error: error.message,
    });
  }
});

// Get Single Picture Authorization
router.get("/picture-authorization/:id", async (req, res) => {
  try {
    const authorization = await PictureAuthorization.findById(req.params.id);
    if (!authorization) {
      return res.status(404).json({
        success: false,
        message: "Picture authorization not found",
      });
    }
    res.json({
      success: true,
      authorization,
    });
  } catch (error) {
    console.error("Error fetching picture authorization:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch picture authorization",
      error: error.message,
    });
  }
});

// Delete Picture Authorization
router.delete("/picture-authorization/:id", async (req, res) => {
  try {
    const authorization = await PictureAuthorization.findByIdAndDelete(
      req.params.id
    );
    if (!authorization) {
      return res.status(404).json({
        success: false,
        message: "Picture authorization not found",
      });
    }
    res.json({
      success: true,
      message: "Picture authorization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting picture authorization:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete picture authorization",
      error: error.message,
    });
  }
});

// ==================== TRANSFER RECORDS ROUTES ====================

// Create Transfer Records
router.post("/transfer-records", async (req, res) => {
  try {
    const transfer = new TransferRecords(req.body);
    await transfer.save();
    res.status(201).json({
      success: true,
      message: "Transfer records request submitted successfully",
      transfer,
    });
  } catch (error) {
    console.error("Error submitting transfer records:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit transfer records",
      error: error.message,
    });
  }
});

// Get all Transfer Records
router.get("/transfer-records", async (req, res) => {
  try {
    const transfers = await TransferRecords.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    console.error("Error fetching transfer records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfer records",
      error: error.message,
    });
  }
});

// Get Single Transfer Records
router.get("/transfer-records/:id", async (req, res) => {
  try {
    const transfer = await TransferRecords.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer records not found",
      });
    }
    res.json({
      success: true,
      transfer,
    });
  } catch (error) {
    console.error("Error fetching transfer records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transfer records",
      error: error.message,
    });
  }
});

// Delete Transfer Records
router.delete("/transfer-records/:id", async (req, res) => {
  try {
    const transfer = await TransferRecords.findByIdAndDelete(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer records not found",
      });
    }
    res.json({
      success: true,
      message: "Transfer records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transfer records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete transfer records",
      error: error.message,
    });
  }
});

// ==================== TUITION CONTRACT ROUTES ====================

// Create Tuition Contract
router.post("/tuition-contract", async (req, res) => {
  try {
    const contract = new TuitionContract(req.body);
    await contract.save();
    res.status(201).json({
      success: true,
      message: "Tuition contract submitted successfully",
      contract,
    });
  } catch (error) {
    console.error("Error submitting tuition contract:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit tuition contract",
      error: error.message,
    });
  }
});

// Get all Tuition Contracts
router.get("/tuition-contract", async (req, res) => {
  try {
    const contracts = await TuitionContract.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      count: contracts.length,
      contracts,
    });
  } catch (error) {
    console.error("Error fetching tuition contracts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tuition contracts",
      error: error.message,
    });
  }
});

// Get Single Tuition Contract
router.get("/tuition-contract/:id", async (req, res) => {
  try {
    const contract = await TuitionContract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Tuition contract not found",
      });
    }
    res.json({
      success: true,
      contract,
    });
  } catch (error) {
    console.error("Error fetching tuition contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tuition contract",
      error: error.message,
    });
  }
});

// Delete Tuition Contract
router.delete("/tuition-contract/:id", async (req, res) => {
  try {
    const contract = await TuitionContract.findByIdAndDelete(req.params.id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Tuition contract not found",
      });
    }
    res.json({
      success: true,
      message: "Tuition contract deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tuition contract:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tuition contract",
      error: error.message,
    });
  }
});

// ==================== NEW ENROLLMENT ROUTES ====================

// Create New Enrollment
router.post(
  "/new-enrollment",
  upload.single("studentPhoto"),
  async (req, res) => {
    try {
      const formData = { ...req.body };

      // Handle photo upload
      if (req.file) {
        formData.studentPhoto = "uploads/student-photos/" + req.file.filename;
      }

      // Convert dateOfBirth to Date object if provided
      if (formData.dateOfBirth) {
        formData.dateOfBirth = new Date(formData.dateOfBirth);
      }

      // Convert admissionDate to Date object if provided
      if (formData.admissionDate) {
        formData.admissionDate = new Date(formData.admissionDate);
      }

      // Convert totalSiblings to number
      if (formData.totalSiblings) {
        formData.totalSiblings = parseInt(formData.totalSiblings, 10);
      }

      const enrollment = new NewEnrollment(formData);
      await enrollment.save();

      res.status(201).json({
        success: true,
        message: "New enrollment submitted successfully",
        enrollment,
      });
    } catch (error) {
      console.error("Error submitting new enrollment:", error);
      res.status(400).json({
        success: false,
        message: "Failed to submit new enrollment",
        error: error.message,
      });
    }
  }
);

// Get all New Enrollments
router.get("/new-enrollment", async (req, res) => {
  try {
    const enrollments = await NewEnrollment.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching new enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch new enrollments",
      error: error.message,
    });
  }
});

// Get Single New Enrollment
router.get("/new-enrollment/:id", async (req, res) => {
  try {
    const enrollment = await NewEnrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "New enrollment not found",
      });
    }
    res.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Error fetching new enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch new enrollment",
      error: error.message,
    });
  }
});

// Update New Enrollment Status
router.patch("/new-enrollment/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const enrollment = await NewEnrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "New enrollment not found",
      });
    }
    res.json({
      success: true,
      message: "Enrollment status updated successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Error updating enrollment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update enrollment status",
      error: error.message,
    });
  }
});

// Delete New Enrollment
router.delete("/new-enrollment/:id", async (req, res) => {
  try {
    const enrollment = await NewEnrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "New enrollment not found",
      });
    }
    res.json({
      success: true,
      message: "New enrollment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting new enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete new enrollment",
      error: error.message,
    });
  }
});

// ==================== COMBINED ENROLLMENT ENDPOINTS ====================

// Get all enrollments (combined data from all forms)
router.get("/enrollments", async (req, res) => {
  try {
    // Fetch all student registrations as the base
    const studentRegistrations = await StudentRegistration.find().sort({
      submittedAt: -1,
    });

    // Build enrollments by matching forms using enrollmentId
    const enrollments = [];

    for (const registration of studentRegistrations) {
      const enrollmentId = registration.enrollmentId;

      // Fetch all related forms by enrollmentId
      const [
        healthForm,
        emergencyContact,
        pictureAuthorization,
        transferRecord,
        tuitionContract,
      ] = await Promise.all([
        HealthForm.findOne({ enrollmentId }),
        EmergencyContact.findOne({ enrollmentId }),
        PictureAuthorization.findOne({ enrollmentId }),
        TransferRecords.findOne({ enrollmentId }),
        TuitionContract.findOne({ enrollmentId }),
      ]);

      const enrollment = {
        id: registration._id,
        enrollmentId,
        status: "Pending", // Default status
        submittedAt: registration.submittedAt,
        studentRegistration: registration,
        healthForm: healthForm || null,
        emergencyContact: emergencyContact || null,
        pictureAuthorization: pictureAuthorization || null,
        transferRecords: transferRecord || null,
        tuitionContract: tuitionContract || null,
      };

      // Determine status based on completion
      const formsCompleted = [
        enrollment.studentRegistration,
        enrollment.healthForm,
        enrollment.emergencyContact,
        enrollment.pictureAuthorization,
        enrollment.transferRecords,
        enrollment.tuitionContract,
      ].filter((form) => form !== null && form !== undefined).length;

      if (formsCompleted === 6) {
        enrollment.status = "Approved";
      } else if (formsCompleted >= 4) {
        enrollment.status = "Under Review";
      } else {
        enrollment.status = "Pending";
      }

      enrollments.push(enrollment);
    }

    res.json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
      error: error.message,
    });
  }
});

// Get single enrollment details
router.get("/enrollments/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Find the student registration by _id
    const studentRegistration = await StudentRegistration.findById(id);
    if (!studentRegistration) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Get the enrollmentId from the student registration
    const enrollmentId = studentRegistration.enrollmentId;

    // Find all related forms by enrollmentId
    const [
      healthForm,
      emergencyContact,
      pictureAuthorization,
      transferRecords,
      tuitionContract,
    ] = await Promise.all([
      HealthForm.findOne({ enrollmentId }),
      EmergencyContact.findOne({ enrollmentId }),
      PictureAuthorization.findOne({ enrollmentId }),
      TransferRecords.findOne({ enrollmentId }),
      TuitionContract.findOne({ enrollmentId }),
    ]);

    const enrollment = {
      id: studentRegistration._id,
      enrollmentId,
      status: "Pending",
      submittedAt: studentRegistration.submittedAt,
      studentRegistration,
      healthForm: healthForm || null,
      emergencyContact: emergencyContact || null,
      pictureAuthorization: pictureAuthorization || null,
      transferRecords: transferRecords || null,
      tuitionContract: tuitionContract || null,
    };

    // Determine status based on completion
    const formsCompleted = [
      enrollment.studentRegistration,
      enrollment.healthForm,
      enrollment.emergencyContact,
      enrollment.pictureAuthorization,
      enrollment.transferRecords,
      enrollment.tuitionContract,
    ].filter((form) => form !== null && form !== undefined).length;

    if (formsCompleted === 6) {
      enrollment.status = "Approved";
    } else if (formsCompleted >= 4) {
      enrollment.status = "Under Review";
    } else {
      enrollment.status = "Pending";
    }

    res.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment",
      error: error.message,
    });
  }
});

module.exports = router;

// ==================== COMBINED ENROLLMENT ENDPOINT ====================

// Combined enrollment submission with file upload
router.post("/enrollment", upload.single("studentPhoto"), async (req, res) => {
  try {
    const enrollmentId = req.body.enrollmentId;

    // Map frontend field names to backend model fields
    const studentData = {
      enrollmentId,
      // Student basic info
      firstName: req.body.studentFullName?.split(" ")[0] || "",
      lastName: req.body.studentFullName?.split(" ").slice(1).join(" ") || "",
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
      gradeLevel: req.body.classGrade,

      // Address
      addressLine1: req.body.residentialAddress,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,

      // Father info
      fatherFirstName: req.body.parentFullName?.split(" ")[0] || "",
      fatherLastName:
        req.body.parentFullName?.split(" ").slice(1).join(" ") || "",
      fatherPhone: req.body.primaryPhone,
      fatherEmail: req.body.email,

      // Mother info (if different person)
      motherFirstName: req.body.parentFullName?.split(" ")[0] || "",
      motherLastName:
        req.body.parentFullName?.split(" ").slice(1).join(" ") || "",
      motherPhone: req.body.alternatePhone,
      motherEmail: req.body.alternateEmail,

      // School info
      previousSchoolName: req.body.previousSchoolName,

      // Additional fields
      citizenship: req.body.birthCertificateNIC,
      siblings: req.body.totalSiblings
        ? [{ name: "Sibling", grade: "Unknown" }]
        : [],

      // Photo
      studentPhoto: req.file
        ? `/uploads/student-photos/${req.file.filename}`
        : null,

      // Signature
      printName: req.body.agreementSignature,
    };

    // Create student registration
    const studentRegistration = new StudentRegistration(studentData);
    await studentRegistration.save();

    res.status(201).json({
      success: true,
      message: "Enrollment submitted successfully",
      enrollmentId,
      studentRegistration,
    });
  } catch (error) {
    console.error("Error submitting enrollment:", error);
    res.status(400).json({
      success: false,
      message: "Failed to submit enrollment",
      error: error.message,
    });
  }
});

// Get enrollment by ID
router.get("/enrollment/:enrollmentId", async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    // Find student registration
    const studentRegistration = await StudentRegistration.findOne({
      enrollmentId,
    });

    if (!studentRegistration) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Find all related forms
    const [
      healthForm,
      emergencyContact,
      pictureAuthorization,
      transferRecords,
      tuitionContract,
    ] = await Promise.all([
      HealthForm.findOne({ enrollmentId }),
      EmergencyContact.findOne({ enrollmentId }),
      PictureAuthorization.findOne({ enrollmentId }),
      TransferRecords.findOne({ enrollmentId }),
      TuitionContract.findOne({ enrollmentId }),
    ]);

    const enrollment = {
      id: studentRegistration._id,
      enrollmentId,
      status: "Pending",
      submittedAt: studentRegistration.submittedAt,
      studentRegistration,
      healthForm: healthForm || null,
      emergencyContact: emergencyContact || null,
      pictureAuthorization: pictureAuthorization || null,
      transferRecords: transferRecords || null,
      tuitionContract: tuitionContract || null,
    };

    // Determine status based on completion
    const formsCompleted = [
      enrollment.studentRegistration,
      enrollment.healthForm,
      enrollment.emergencyContact,
      enrollment.pictureAuthorization,
      enrollment.transferRecords,
      enrollment.tuitionContract,
    ].filter((form) => form !== null && form !== undefined).length;

    if (formsCompleted === 6) {
      enrollment.status = "Approved";
    } else if (formsCompleted >= 4) {
      enrollment.status = "Under Review";
    } else {
      enrollment.status = "Pending";
    }

    res.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment",
      error: error.message,
    });
  }
});

// Get all enrollments
router.get("/enrollments", async (req, res) => {
  try {
    const studentRegistrations = await StudentRegistration.find().sort({
      submittedAt: -1,
    });

    const enrollments = [];

    for (const registration of studentRegistrations) {
      const enrollmentId = registration.enrollmentId;

      // Fetch all related forms by enrollmentId
      const [
        healthForm,
        emergencyContact,
        pictureAuthorization,
        transferRecords,
        tuitionContract,
      ] = await Promise.all([
        HealthForm.findOne({ enrollmentId }),
        EmergencyContact.findOne({ enrollmentId }),
        PictureAuthorization.findOne({ enrollmentId }),
        TransferRecords.findOne({ enrollmentId }),
        TuitionContract.findOne({ enrollmentId }),
      ]);

      const enrollment = {
        id: registration._id,
        enrollmentId,
        status: "Pending",
        submittedAt: registration.submittedAt,
        studentRegistration: registration,
        healthForm: healthForm || null,
        emergencyContact: emergencyContact || null,
        pictureAuthorization: pictureAuthorization || null,
        transferRecords: transferRecords || null,
        tuitionContract: tuitionContract || null,
      };

      // Determine status based on completion
      const formsCompleted = [
        enrollment.studentRegistration,
        enrollment.healthForm,
        enrollment.emergencyContact,
        enrollment.pictureAuthorization,
        enrollment.transferRecords,
        enrollment.tuitionContract,
      ].filter((form) => form !== null && form !== undefined).length;

      if (formsCompleted === 6) {
        enrollment.status = "Approved";
      } else if (formsCompleted >= 4) {
        enrollment.status = "Under Review";
      } else {
        enrollment.status = "Pending";
      }

      enrollments.push(enrollment);
    }

    res.json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
      error: error.message,
    });
  }
});

module.exports = router;
