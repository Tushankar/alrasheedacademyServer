require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const galleryRoutes = require("./routes/gallery");
const calendarRoutes = require("./routes/calendar");
const jobApplicationRoutes = require("./routes/jobApplications");
const volunteerApplicationRoutes = require("./routes/volunteerApplications");
const surveyRoutes = require("./routes/surveys");
const formRoutes = require("./routes/forms");
const renrollRoutes = require("./routes/renroll");
const navbarRoutes = require("./routes/navbar");

const app = express();
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://alrasheedacademy.netlify.app"]
        : ["http://localhost:3000", "https://alrasheedacademy.netlify.app"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    optionsSuccessStatus: 200,
    maxAge: 3600,
  })
);

// Handle preflight explicitly
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI in environment. Please set it before starting the server."
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/volunteer-applications", volunteerApplicationRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/renroll", renrollRoutes);
app.use("/api/navbar", navbarRoutes);
console.log("✅ Forms routes registered at /api/forms");
console.log("✅ Renroll routes registered at /api/renroll");

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) =>
  res.json({ ok: true, message: "Auth server running" })
);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
