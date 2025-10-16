const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    date: { 
      type: String, 
      required: true 
    },
    endDate: { 
      type: String 
    },
    type: { 
      type: String, 
      required: true 
    },
    color: { 
      type: String, 
      required: true 
    },
    customColor: { 
      type: String 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
