const mongoose = require("mongoose");

const navbarItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  dropdown: [
    {
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      content: {
        type: String,
        default: "",
      },
      images: [
        {
          type: String,
          default: "",
        },
      ],
      dropdown: [
        {
          name: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
          isActive: {
            type: Boolean,
            default: true,
          },
        },
      ],
    },
  ],
});

const navbarSchema = new mongoose.Schema({
  items: [navbarItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Navbar", navbarSchema);
