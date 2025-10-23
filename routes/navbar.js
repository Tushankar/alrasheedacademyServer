const express = require("express");
const Navbar = require("../models/Navbar");

const router = express.Router();

// GET /api/navbar - Get navbar items
router.get("/", async (req, res) => {
  try {
    let navbar = await Navbar.findOne();
    if (!navbar) {
      // Create default navbar if none exists
      navbar = new Navbar({
        items: [
          { name: "Home", url: "/", icon: "Home" },
          {
            name: "About",
            url: "#",
            icon: "User",
            dropdown: [
              { name: "Mission and Vision", url: "/mission-vision" },
              { name: "Principal's message", url: "/principal-message" },
              { name: "School Board", url: "/team" },
              { name: "General Administration", url: "/administration" },
              { name: "Parent handbook", url: "/parent-handbook" },
              {
                name: "Faculty",
                url: "#",
                dropdown: [
                  { name: "K-3 Section", url: "/k3-section" },
                  { name: "Boys' Section", url: "/boys-section" },
                  { name: "Girls' Section", url: "/girls-section" },
                ],
              },
            ],
          },
          {
            name: "Admission",
            url: "#",
            icon: "FileText",
            dropdown: [
              { name: "New Enrollment", url: "/enrollment" },
              { name: "Re-Enrollment", url: "/renroll" },
              { name: "Uniform Policy", url: "/dress-code" },
              { name: "Bus Policy", url: "/bus-policy" },
              { name: "Supply List", url: "/supply-list" },
            ],
          },
          {
            name: "Learning",
            url: "#",
            icon: "BookOpen",
            dropdown: [
              { name: "Calendar", url: "/calendar" },
              { name: "College Preparatory", url: "/college-preparatory" },
              { name: "Islamic Studies & Qur'an", url: "/islamic-studies" },
              { name: "Curricular", url: "/curricular" },
            ],
          },
          { name: "Gallery", url: "/gallery", icon: "Image" },
          {
            name: "Accreditation",
            url: "#",
            icon: "Award",
            dropdown: [
              { name: "Staff Surveys", url: "/staff-surveys" },
              { name: "Parents Surveys", url: "/parent-surveys" },
              { name: "Students Surveys", url: "/student-surveys" },
            ],
          },
          {
            name: "Career",
            url: "#",
            icon: "Briefcase",
            dropdown: [
              { name: "Job Application", url: "/career/job-application" },
              {
                name: "Volunteer Application",
                url: "/career/volunteer-application",
              },
            ],
          },
        ],
      });
      await navbar.save();
    }
    res.json(navbar.items);
  } catch (error) {
    console.error("Error fetching navbar:", error);
    res.status(500).json({ error: "Failed to fetch navbar" });
  }
});

// PUT /api/navbar - Update navbar items
router.put("/", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array is required" });
    }

    let navbar = await Navbar.findOne();
    if (!navbar) {
      navbar = new Navbar();
    }

    navbar.items = items;
    navbar.updatedAt = new Date();
    await navbar.save();

    res.json({ success: true, items: navbar.items });
  } catch (error) {
    console.error("Error updating navbar:", error);
    res.status(500).json({ error: "Failed to update navbar" });
  }
});

module.exports = router;
