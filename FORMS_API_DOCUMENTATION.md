# Forms API Documentation

Complete backend implementation for all 6 enrollment forms.

## Base URL
```
http://localhost:4000/api/forms
```

---

## 1. Student Registration Form

### Endpoints

#### Submit Student Registration
```http
POST /api/forms/student-registration
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "dateOfBirth": "2010-05-15",
  "gradeLevel": "5",
  "houseNumber": "123",
  "addressLine1": "Main Street",
  "addressLine2": "Apt 4B",
  "city": "Buffalo",
  "state": "NY",
  "zipCode": "14201",
  "citizenship": "US Citizen",
  "ethnicity": "Asian",
  "fatherFirstName": "Robert",
  "fatherLastName": "Doe",
  "fatherPhone": "716-555-0100",
  "fatherEmail": "robert@email.com",
  "motherFirstName": "Jane",
  "motherLastName": "Doe",
  "motherPhone": "716-555-0101",
  "motherEmail": "jane@email.com",
  "previousSchoolName": "Previous School",
  "siblings": [
    { "name": "Jane Doe", "grade": "3" }
  ],
  "printName": "John Doe"
}
```

#### Get All Registrations
```http
GET /api/forms/student-registration
```

#### Get Single Registration
```http
GET /api/forms/student-registration/:id
```

#### Delete Registration
```http
DELETE /api/forms/student-registration/:id
```

---

## 2. Emergency Contact Form

### Endpoints

#### Submit Emergency Contact
```http
POST /api/forms/emergency-contact
```

**Request Body:**
```json
{
  "emergencyContact1Name": "Uncle Bob",
  "emergencyContact1Phone": "716-555-0200",
  "emergencyContact1Relationship": "Uncle",
  "emergencyContact2Name": "Aunt Mary",
  "emergencyContact2Phone": "716-555-0201",
  "emergencyContact2Relationship": "Aunt",
  "emergencyContact3Name": "Grandma Sarah",
  "emergencyContact3Phone": "716-555-0202",
  "emergencyContact3Relationship": "Grandmother",
  "pediatricianName": "Dr. Smith",
  "pediatricianPhone": "716-555-5555",
  "authorizedPickup": "Uncle Bob, Aunt Mary",
  "emergencyFormSignature": "John Doe"
}
```

#### Get All Emergency Contacts
```http
GET /api/forms/emergency-contact
```

#### Get Single Emergency Contact
```http
GET /api/forms/emergency-contact/:id
```

#### Delete Emergency Contact
```http
DELETE /api/forms/emergency-contact/:id
```

---

## 3. Health Form

### Endpoints

#### Submit Health Form
```http
POST /api/forms/health-form
```

**Request Body:**
```json
{
  "insuranceCompany": "Blue Cross",
  "physicianName": "Dr. Johnson",
  "physicianNumber": "716-555-6666",
  "hasDisabilities": "No",
  "disabilityExplanation": "",
  "medicalConditions": {
    "asthma": true,
    "diabetes": false,
    "convulsion": false,
    "heartTrouble": false,
    "frequentCold": false,
    "stomachUpsets": false,
    "faintingSpells": false,
    "urinaryProblems": false,
    "skinRash": false,
    "soiling": false,
    "soreThroats": false,
    "earInfection": false,
    "noneOfAbove": false
  },
  "pastDiseases": {
    "mumps": false,
    "chickenpox": true,
    "hepatitis": false,
    "scarletFever": false,
    "tuberculosis": false,
    "measles": false,
    "noneOfAbove": false
  },
  "pastConditions": "Had chickenpox at age 5",
  "takesRegularMedication": "Yes",
  "medicationExplanation": "Albuterol for asthma",
  "hasAllergies": "Yes",
  "allergiesList": "Peanuts, bee stings",
  "healthFormSignature": "John Doe"
}
```

#### Get All Health Forms
```http
GET /api/forms/health-form
```

#### Get Single Health Form
```http
GET /api/forms/health-form/:id
```

#### Delete Health Form
```http
DELETE /api/forms/health-form/:id
```

---

## 4. Picture Authorization Form

### Endpoints

#### Submit Picture Authorization
```http
POST /api/forms/picture-authorization
```

**Request Body:**
```json
{
  "pictureAuthSignature": "John Doe",
  "disciplineAcknowledgment": "I acknowledge the discipline policy",
  "signerRole": "Parent",
  "disciplineFormSignature": "John Doe"
}
```

#### Get All Picture Authorizations
```http
GET /api/forms/picture-authorization
```

#### Get Single Picture Authorization
```http
GET /api/forms/picture-authorization/:id
```

#### Delete Picture Authorization
```http
DELETE /api/forms/picture-authorization/:id
```

---

## 5. Transfer Records Form

### Endpoints

#### Submit Transfer Records Request
```http
POST /api/forms/transfer-records
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2010-05-15",
  "grade": "5",
  "previousSchoolName": "Previous Elementary School",
  "previousSchoolAddress": "456 School Rd",
  "previousSchoolCity": "Buffalo",
  "previousSchoolState": "NY",
  "previousSchoolZip": "14201",
  "previousSchoolPhone": "716-555-7777",
  "parentGuardianName": "Robert Doe",
  "parentGuardianPhone": "716-555-0100",
  "parentGuardianEmail": "robert@email.com",
  "recordsNeeded": "Academic transcripts, immunization records",
  "urgencyLevel": "Standard",
  "transferFormSignature": "Robert Doe"
}
```

#### Get All Transfer Records
```http
GET /api/forms/transfer-records
```

#### Get Single Transfer Records
```http
GET /api/forms/transfer-records/:id
```

#### Delete Transfer Records
```http
DELETE /api/forms/transfer-records/:id
```

---

## 6. Tuition Contract Form

### Endpoints

#### Submit Tuition Contract
```http
POST /api/forms/tuition-contract
```

**Request Body:**
```json
{
  "guardianFirstName": "Robert",
  "guardianLastName": "Doe",
  "guardianPhone": "716-555-0100",
  "guardianEmail": "robert@email.com",
  "guardianAddressLine1": "123 Main Street",
  "guardianAddressLine2": "Apt 4B",
  "guardianCity": "Buffalo",
  "guardianState": "NY",
  "guardianZipCode": "14201",
  "tuitionAcknowledgment": true,
  "textbookFeeAcknowledgment": true,
  "applicationFeeAcknowledgment": true,
  "paymentOption1": false,
  "paymentOption2": true,
  "paymentOption3": false,
  "tuitionContractSignature": "Robert Doe"
}
```

#### Get All Tuition Contracts
```http
GET /api/forms/tuition-contract
```

#### Get Single Tuition Contract
```http
GET /api/forms/tuition-contract/:id
```

#### Delete Tuition Contract
```http
DELETE /api/forms/tuition-contract/:id
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": { /* form data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Models Created

1. ✅ **StudentRegistration** - Student info, parent info, school history, siblings
2. ✅ **EmergencyContact** - 3 emergency contacts, pediatrician, authorized pickups
3. ✅ **HealthForm** - Insurance, medical conditions, allergies, medications
4. ✅ **PictureAuthorization** - Picture consent, discipline acknowledgment
5. ✅ **TransferRecords** - Student info, previous school info
6. ✅ **TuitionContract** - Guardian info, payment options, contract signature

---

## Database Collections

All forms are stored in separate MongoDB collections:
- `studentregistrations`
- `emergencycontacts`
- `healthforms`
- `pictureauthorizations`
- `transferrecords`
- `tuitioncontracts`

---

## Integration Example (Frontend)

```javascript
// Submit Student Registration
const submitRegistration = async (formData) => {
  try {
    const response = await fetch('http://localhost:4000/api/forms/student-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('Registration submitted successfully!');
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to submit registration');
  }
};

// Get All Registrations
const getRegistrations = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/forms/student-registration');
    const data = await response.json();
    
    if (data.success) {
      console.log('Registrations:', data.registrations);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Notes

- All timestamps are automatically added with `submittedAt` field
- All endpoints support CORS from `http://localhost:3000`
- Required fields are validated by Mongoose schemas
- IDs are MongoDB ObjectIds (24-character hex string)
