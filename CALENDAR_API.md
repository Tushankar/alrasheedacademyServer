# Calendar Event API Documentation

## Overview
This API provides endpoints for managing calendar events with support for event types, colors, and date ranges.

## Base URL
```
http://localhost:4000/api/calendar
```

## Endpoints

### 1. Get All Events
**GET** `/events`

Retrieves all calendar events sorted by date.

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "School Closed",
      "date": "2024-12-25",
      "endDate": "2024-12-25",
      "type": "school-closed",
      "color": "blue-600",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Events by Date Range
**GET** `/events/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

Retrieves events within a specific date range.

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "events": [...]
}
```

### 3. Get Single Event
**GET** `/events/:id`

Retrieves a specific event by ID.

**Parameters:**
- `id`: MongoDB ObjectId of the event

**Response:**
```json
{
  "success": true,
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "School Closed",
    ...
  }
}
```

### 4. Create Event
**POST** `/events`

Creates a new calendar event.

**Request Body:**
```json
{
  "title": "Winter Break",
  "date": "2024-12-20",
  "endDate": "2024-12-31",
  "type": "school-closed",
  "color": "blue-600",
  "customColor": "#ff0000"
}
```

**Required Fields:**
- `title`: Event title (string)
- `date`: Event start date (YYYY-MM-DD)
- `type`: Event type (string)
- `color`: Event color identifier (string)

**Optional Fields:**
- `endDate`: Event end date (defaults to start date)
- `customColor`: Custom hex color (for custom color type)

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    ...
  }
}
```

### 5. Update Event
**PUT** `/events/:id`

Updates an existing event.

**Parameters:**
- `id`: MongoDB ObjectId of the event

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "date": "2024-12-21",
  "endDate": "2024-12-31",
  "type": "school-closed",
  "color": "blue-600",
  "customColor": "#ff0000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": {...}
}
```

### 6. Delete Event
**DELETE** `/events/:id`

Deletes an event.

**Parameters:**
- `id`: MongoDB ObjectId of the event

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### 7. Bulk Create Events
**POST** `/events/bulk`

Creates multiple events at once.

**Request Body:**
```json
{
  "events": [
    {
      "title": "Event 1",
      "date": "2024-12-20",
      "type": "school-closed",
      "color": "blue-600"
    },
    {
      "title": "Event 2",
      "date": "2024-12-21",
      "type": "school-events",
      "color": "yellow-300"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 events created successfully",
  "events": [...]
}
```

## Event Types & Colors

The following event types are predefined:

| Type | Label | Color |
|------|-------|-------|
| `none` | No Color (Default) | Gray |
| `school-closed` | School Closed | Blue (blue-600) |
| `early-release` | Early Release | Purple (purple-400) |
| `school-events` | School Events | Yellow (yellow-300) |
| `nys-exams` | NYS Exams | Orange (orange-300) |
| `quarter-exams` | Quarter Exams | Orange (orange-400) |
| `no-busing` | No Busing | Green (green-400) |
| `staff-development` | Staff Development | Light Blue (blue-200) |
| `parent-conferences` | Parent Teacher Conferences | Gray (gray-300) |
| `first-last-day` | First & Last Day of School | Green Border (green-500) |
| `quarter-end` | Quarter End | Red Border (red-500) |

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

## Frontend Integration

Both calendar components automatically sync with the backend:

1. **CalendarView.js** - Monthly grid calendar view
2. **fullscreen-calendar.tsx** - Full-screen calendar with date-fns

### Features:
- ✅ Add events with color-coded categories
- ✅ Delete events with confirmation
- ✅ Multi-day event support (start and end dates)
- ✅ Real-time synchronization between both calendars
- ✅ Legend displaying all event types
- ✅ Responsive design with dark mode support

## Setup Instructions

1. **Start the backend server:**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Environment Variables:**
   Ensure your `.env` file in the server directory contains:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=4000
   ```

## Testing

You can test the API using tools like Postman, curl, or Thunder Client.

**Example curl request:**
```bash
curl -X POST http://localhost:4000/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "date": "2024-12-25",
    "type": "school-closed",
    "color": "blue-600"
  }'
```
