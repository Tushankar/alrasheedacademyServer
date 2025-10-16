# Email Configuration Guide

## ✉️ The email endpoint is now working!

**Current Status:** The endpoint `/api/job-applications/:id/send-email` is set up and returns success. Emails are logged to console but not actually sent yet.

---

## 🔧 To Enable Real Email Sending:

### **Option 1: Gmail (Easiest for Testing)**

1. **Install nodemailer:**
```bash
npm install nodemailer
```

2. **Create App Password in Gmail:**
   - Go to Google Account → Security
   - Enable 2-Factor Authentication
   - Go to App Passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Add to `.env` file:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

4. **Uncomment the nodemailer code** in `routes/jobApplications.js` (lines 276-297)

---

### **Option 2: SendGrid (Better for Production)**

1. **Install SendGrid:**
```bash
npm install @sendgrid/mail
```

2. **Get API Key:**
   - Sign up at https://sendgrid.com
   - Go to Settings → API Keys
   - Create API Key
   - Copy the key

3. **Add to `.env` file:**
```env
SENDGRID_API_KEY=your-api-key-here
EMAIL_FROM=hr@alrasheedacademy.org
```

4. **Replace nodemailer code with:**
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: to,
  from: process.env.EMAIL_FROM,
  subject: subject,
  text: message,
  html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
           <p style="white-space: pre-line;">${message.replace(/\n/g, '<br>')}</p>
         </div>`,
};

await sgMail.send(msg);
```

---

### **Option 3: Custom SMTP Server**

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.yourserver.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

---

## 📋 Current Endpoint Details

**Endpoint:** `POST /api/job-applications/:id/send-email`

**Request Body:**
```json
{
  "to": "applicant@email.com",
  "subject": "Application Update",
  "message": "Email message here...",
  "applicantName": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "to": "applicant@email.com",
    "subject": "Application Update",
    "sentAt": "2025-01-10T10:00:00.000Z"
  }
}
```

---

## ✅ What's Working Now:

1. ✅ Email modal in admin panel
2. ✅ Three quick templates (Interview, Acknowledgment, Request Info)
3. ✅ Form validation (subject & message required)
4. ✅ Backend API endpoint
5. ✅ Console logging of emails
6. ✅ Success/error handling

## ⏳ What Needs Configuration:

1. ⏳ Email service credentials
2. ⏳ Actual email sending (uncomment code after adding credentials)

---

## 🚀 Quick Test:

The email feature works now! When you click "Send Email":
- ✅ Modal shows recipient info
- ✅ Can compose message
- ✅ Backend receives request
- ✅ Returns success
- ✅ Console logs email details

**To actually send emails:** Follow Option 1, 2, or 3 above.
