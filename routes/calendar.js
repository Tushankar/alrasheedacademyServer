const express = require("express");
const router = express.Router();
const CalendarEvent = require("../models/CalendarEvent");

// Get all calendar events
router.get("/events", async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ date: 1 });
    res.json({ success: true, events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
});

// Get events for a specific date range
router.get("/events/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const events = await CalendarEvent.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    res.json({ success: true, events });
  } catch (error) {
    console.error("Error fetching calendar events by range:", error);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
});

// Get a single event by ID
router.get("/events/:id", async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.json({ success: true, event });
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    res.status(500).json({ success: false, message: "Failed to fetch event" });
  }
});

// Create a new calendar event
router.post("/events", async (req, res) => {
  try {
    const { title, date, endDate, type, color, customColor } = req.body;
    
    // Validation
    if (!title || !date || !type || !color) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: title, date, type, color" 
      });
    }
    
    const newEvent = new CalendarEvent({
      title,
      date,
      endDate: endDate || date,
      type,
      color,
      customColor
    });
    
    await newEvent.save();
    
    res.status(201).json({ 
      success: true, 
      message: "Event created successfully",
      event: newEvent 
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({ success: false, message: "Failed to create event" });
  }
});

// Update an existing calendar event
router.put("/events/:id", async (req, res) => {
  try {
    const { title, date, endDate, type, color, customColor } = req.body;
    
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Update fields if provided
    if (title) event.title = title;
    if (date) event.date = date;
    if (endDate !== undefined) event.endDate = endDate || date;
    if (type) event.type = type;
    if (color) event.color = color;
    if (customColor !== undefined) event.customColor = customColor;
    
    await event.save();
    
    res.json({ 
      success: true, 
      message: "Event updated successfully",
      event 
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    res.status(500).json({ success: false, message: "Failed to update event" });
  }
});

// Delete a calendar event
router.delete("/events/:id", async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Event deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({ success: false, message: "Failed to delete event" });
  }
});

// Bulk create events (useful for seeding)
router.post("/events/bulk", async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid events array" 
      });
    }
    
    const createdEvents = await CalendarEvent.insertMany(events);
    
    res.status(201).json({ 
      success: true, 
      message: `${createdEvents.length} events created successfully`,
      events: createdEvents 
    });
  } catch (error) {
    console.error("Error bulk creating calendar events:", error);
    res.status(500).json({ success: false, message: "Failed to create events" });
  }
});

module.exports = router;
