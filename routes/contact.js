const express = require("express");
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");

const router = express.Router();

// Create transporter with improved configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// POST /api/contact/submit
router.post("/submit", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save to DB
    const contact = new Contact({
      name,
      email,
      message,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await contact.save();

    // Try to send email, but don't fail if it doesn't work
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "info@alrasheedacademy.org",
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email notification sent successfully");
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError.message);
      // Continue anyway - contact is saved in DB
    }

    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/contact
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// GET /api/contact/:id
router.get("/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

// PUT /api/contact/:id/status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["New", "In Progress", "Replied"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ success: true, contact });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// POST /api/contact/:id/reply
router.post("/:id/reply", async (req, res) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Try to send reply email
    let emailSent = false;
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contact.email,
        subject: `Re: Your message to Al-Rasheed Academy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank you for contacting Al-Rasheed Academy</h2>
            <p>Dear ${contact.name},</p>
            <p>Thank you for your message. We have received your inquiry and wanted to respond.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Your Original Message:</h3>
              <p style="color: #6b7280;">${contact.message.replace(
                /\n/g,
                "<br>"
              )}</p>
            </div>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Our Response:</h3>
              <p style="color: #1e40af;">${replyMessage.replace(
                /\n/g,
                "<br>"
              )}</p>
            </div>
            
            <p>If you have any further questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>The Al-Rasheed Academy Team</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated response to your inquiry submitted on ${new Date(
                contact.submittedAt
              ).toLocaleString()}.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log("Reply email sent successfully to:", contact.email);
    } catch (emailError) {
      console.error("Failed to send reply email:", emailError.message);
      // Continue anyway - we'll update the status and inform the user
    }

    // Update status to Replied
    contact.status = "Replied";
    await contact.save();

    if (emailSent) {
      res.json({ success: true, message: "Reply sent successfully" });
    } else {
      res.json({
        success: true,
        message:
          "Reply saved but email could not be sent. Please check email configuration.",
        emailSent: false,
      });
    }
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

module.exports = router;
