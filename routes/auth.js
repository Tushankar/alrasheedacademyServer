const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const { CMS } = require("../models/User");

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Try cookie first, then Authorization header (Bearer)
  let token = null;
  if (req.cookies && req.cookies.token) token = req.cookies.token;
  if (!token && req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") token = parts[1];
  }

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = verified;
    next();
  } catch (err) {
    console.error("verifyToken error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !phone || !role || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, phone, role, passwordHash });
    await user.save();

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/admin - Protected route for admin dashboard
router.get("/admin", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  res.json({ message: "Welcome to admin dashboard", user: req.user });
});

// GET /api/auth/me - Get current user if authenticated
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Reset code sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.resetCode !== code || user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/cms/:page - Get CMS content for a page
router.get("/cms/:page", async (req, res) => {
  try {
    const { page } = req.params;
    const cms = await CMS.findOne({ page });
    if (!cms) {
      // Provide sensible defaults for known pages to avoid 404s
      const getDefaultCmsContent = (p) => {
        if (p === "principal-message") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "Principal's Message",
              breadcrumb: "Home › Principal's Message",
            },
            content: {
              greeting: "Dear ARA Community,",
              paragraphs: [
                "I am delighted to extend my warmest greetings to each member of our esteemed school community and it is with great pleasure that I introduce myself as the School Principal and one of the founders of our beloved institution.",
                "With over 25 years of dedicated service in the field of education and management, I bring a wealth of experience and a steadfast commitment to fostering an environment that nurtures academic excellence, character development, and lifelong learning.",
                "Having played a pivotal role as the founding president of our school, I have been intricately involved in shaping its vision and mission from the outset. Our journey, marked by milestones and achievements, reflects the collective efforts of a dedicated team, supportive parents, and, most importantly, our talented students.",
                "My passion for education stems from a belief in its transformative power and the profound impact it has on individuals and society at large. As we move forward, I am committed to upholding the principles that have been the cornerstone of our institution—integrity, inclusivity, innovation, and a relentless pursuit of excellence.",
                "I am eager to work collaboratively with our esteemed faculty, dedicated staff, involved parents, and, of course, our bright and enthusiastic students. Together, we will continue to build on the strong foundation laid by the visionaries who founded this school.",
                "I invite each of you to join hands as we embark on another exciting chapter in the history of our school. Your support, engagement, and commitment are invaluable, and together, we will create an environment where every student can thrive, learn, and achieve their fullest potential.",
                "Thank you for entrusting me with the responsibility of leading our school. I am honored to serve in this capacity and look forward to a year filled with growth, learning, and success.",
              ],
              signature: {
                closing: "Best regards,",
                title: "School Principal",
                school: "Al-Rasheed Academy",
              },
            },
          };
        }

        if (p === "team") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "The Board Members",
              breadcrumb: "Home › Team",
            },
            members: [
              {
                name: "Taha Omar",
                role: "Chairman",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "#",
              },
              {
                name: "Shukry Elbaneh",
                role: "Treasurer",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "#",
              },
              {
                name: "Mohamed A. Mohamed",
                role: "Secretary",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "#",
              },
              {
                name: "Anwar Al-Kalai",
                role: "Board Advisor",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "#",
              },
              {
                name: "Fadl Faadel",
                role: "Fundraising Director",
                avatar: "https://alt.tailus.io/images/team/member-five.webp",
                link: "#",
              },
            ],
          };
        }

        if (p === "administration") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "General Administration",
              breadcrumb: "Home › Administration",
            },
            members: [
              {
                name: "Anwar Al-Kalai",
                role: "School Principal",
                avatar:
                  "https://www.alrasheedacademy.org/Admin/images/26a478f08fa3204098346fcbcdbfc2831758763720jpeg",
                link: "#",
              },
              {
                name: "Ahmed Nada",
                role: "Academic Director",
                avatar:
                  "https://www.alrasheedacademy.org/Admin/images/289648f191687d568b74a00ccd76f3771758763603.png",
                link: "#",
              },
              {
                name: "Abdullah Mardaie",
                role: "Office Manager",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "#",
              },
            ],
          };
        }

        if (p === "k3-faculty") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "K-3 Section Faculty",
              breadcrumb: "Home › K-3 Faculty",
            },
            members: [
              {
                name: "Kafaih Abdallah",
                role: "Admin Asst",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:kabdallah@alrasheedacademy.org",
              },
              {
                name: "Fatima Faadel",
                role: "Quran Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:ffaadel@alrasheedacademy.org",
              },
              {
                name: "Nusrah Ali",
                role: "Religious Teacher",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:nali@alrasheedacademy.org",
              },
              {
                name: "Ammarah Gaber",
                role: "1st Grade Homeroom Teacher",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "mailto:agaber@alrasheedacademy.org",
              },
              {
                name: "Asma Zaied",
                role: "1st Grade Homeroom Teacher",
                avatar: "https://alt.tailus.io/images/team/member-five.webp",
                link: "mailto:azaied@alrasheedacademy.org",
              },
              {
                name: "Sumaya Nasser",
                role: "2nd Grade Homeroom Teacher",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:snasser@alrasheedacademy.org",
              },
              {
                name: "Alaa Abadi",
                role: "2nd Grade Homeroom Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:aabadi@alrasheedacademy.org",
              },
              {
                name: "Ayih Elbaneh",
                role: "3rd Grade Homeroom Teacher",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:aelbaneh@alrasheedacademy.org",
              },
              {
                name: "Nathar Eloudi",
                role: "3rd Grade Homeroom Teacher",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "mailto:neloudi@alrasheedacademy.org",
              },
            ],
          };
        }

        if (p === "boys-faculty") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "Boys' Section Faculty",
              breadcrumb: "Home › Boys Faculty",
            },
            members: [
              {
                name: "Abdullah M Mardaie",
                role: "Administrator",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:amardaie@alrasheedacademy.org",
              },
              {
                name: "Walid Al Salahi",
                role: "Quran Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:aibrahim@alrasheedacademy.org",
              },
              {
                name: "Abdo M Fadhel",
                role: "Islamic Studies Teacher",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:afadhel@alrasheedacademy.org",
              },
              {
                name: "Mohamed A Mohamed",
                role: "Arabic Teacher",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "mailto:mmohamed@alrasheedacademy.org",
              },
              {
                name: "Yousif Ahmed",
                role: "Religious Teacher",
                avatar: "https://alt.tailus.io/images/team/member-five.webp",
                link: "mailto:yousifahmed@alrasheedacademy.org",
              },
              {
                name: "Yousif Fadhel",
                role: "Religious Teacher",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:yfadhel@alrasheedacademy.org",
              },
              {
                name: "Mohamed Al-Kalai",
                role: "GYM & Health Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:maalkalai@alrasheedacademy.org",
              },
              {
                name: "Rathwan G Ali",
                role: "ELA Teacher",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:rali@alrasheedacademy.org",
              },
              {
                name: "Magdi Ahmed",
                role: "Social Studies Teacher",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "mailto:mahmed@alrasheedacademy.org",
              },
              {
                name: "Nieal Alwan",
                role: "Science Teacher",
                avatar: "https://alt.tailus.io/images/team/member-five.webp",
                link: "mailto:nalwan@alrasheedacademy.org",
              },
              {
                name: "Hisham khelly",
                role: "Mathematics Teacher",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:hkhelly@alrasheedacademy.org",
              },
              {
                name: "Ahmed Mohamed",
                role: "Health/Gym Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:amohamed@alrasheedacademy.org",
              },
              {
                name: "Mohammad A Rahman",
                role: "Support Staff",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:mrahman@alrasheedacademy.org",
              },
            ],
          };
        }

        if (p === "girls-faculty") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "Girls' Section Faculty",
              breadcrumb: "Home › Girls Faculty",
            },
            members: [
              {
                name: "Razan Abdulgalil",
                role: "Admin Asst",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:rabdulgalil@alrasheedacademy.org",
              },
              {
                name: "Muna Abdulla",
                role: "Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:mabdulla@alrasheedacademy.org",
              },
              {
                name: "Yasmeen Fadel",
                role: "Religious Teacher",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:yasmeen_fadel@alrasheedacademy.org",
              },
              {
                name: "Loula Ali",
                role: "Religious Teacher",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "mailto:lali@alrasheedacademy.org",
              },
              {
                name: "Nora Mohamed",
                role: "Teacher",
                avatar: "https://alt.tailus.io/images/team/member-five.webp",
                link: "mailto:noramohamed@alrasheedacademy.org",
              },
              {
                name: "Hudda Al-Kalai",
                role: "4th & 5th Grade Teacher",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:halkalai@alrasheedacademy.org",
              },
              {
                name: "Kemah Freeman",
                role: "Social Studies Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:kfreeman@alrasheedacademy.org",
              },
              {
                name: "Aseel Fadhil",
                role: "Science Teacher",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:afadhil@alrasheedacademy.org",
              },
              {
                name: "Zayba Yasin",
                role: "Mathematics Teacher",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "mailto:zyasin@alrasheedacademy.org",
              },
              {
                name: "Fatima Mohamed",
                role: "Mathematics Teacher",
                avatar: "https://alt.tailus.io/images/team/member-five.webp",
                link: "mailto:ffaadel@alrasheedacademy.org",
              },
              {
                name: "Kawlah A Al-Kalai",
                role: "ELA Teacher",
                avatar: "https://alt.tailus.io/images/team/member-one.webp",
                link: "mailto:kalkalai@alrasheedacademy.org",
              },
              {
                name: "Amira Mohamed",
                role: "Health/Gym Teacher",
                avatar: "https://alt.tailus.io/images/team/member-two.webp",
                link: "mailto:amiramohamed@alrasheedacademy.org",
              },
              {
                name: "Asma Nashwan",
                role: "Teacher",
                avatar: "https://alt.tailus.io/images/team/member-three.webp",
                link: "mailto:anashwan@alrasheedacademy.org",
              },
              {
                name: "Raheq Abdulla",
                role: "Islamic Studies Teacher",
                avatar: "https://alt.tailus.io/images/team/member-four.webp",
                link: "mailto:Sali@alrasheedacademy.org",
              },
            ],
          };
        }

        if (p === "hero") {
          return {
            arabicText: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ",
            subtitle: "Excellence in Islamic Education",
            titleLine1: "Recognized by",
            titleLine2: "New York State",
            titleLine3: "Education Department",
            backgroundImages: [
              "/assets/istudies_1.png",
              "/assets/istudies_2.png",
              "/assets/istudies_3.png",
              "/assets/istudies_4.png",
              "/assets/istudies_5.png",
              "/assets/istudies_6.png",
              "/assets/istudies_7.png",
            ],
            socialLinks: {
              instagram: "#",
              youtube: "#",
              twitter: "#",
            },
          };
        }

        if (p === "about-us") {
          return {
            title: "Know About Us",
            mainHeading: "We Innovate Discover ARA",
            highlightedText:
              "Our commitment to fostering compassion and kindness reflects our dedication to the holistic development of each child and their smooth integration into our school environment.",
            features: [
              {
                icon: "DollarSign",
                text: "Quality education shouldn't come with exorbitant fees.",
              },
              {
                icon: "Clock",
                text: "Families deserve a streamlined enrollment process.",
              },
              {
                icon: "Users",
                text: "Students thrive with personalized attention and support.",
              },
              {
                icon: "MessageSquare",
                text: "Open communication between parents, teachers, and students.",
              },
              {
                icon: "UserX",
                text: "Direct access to educational excellence without barriers.",
              },
            ],
            images: [
              "https://www.alrasheedacademy.org/Admin/uploads/657a2bbe855ef1702505406.jpg",
              "https://www.alrasheedacademy.org/Admin/uploads/657a2bca0b9781702505418.jpg",
              "https://www.alrasheedacademy.org/Admin/uploads/657a2bf0ccb0c1702505456.jpg",
            ],
            rating: {
              score: "4.9/5",
              reviews: "19,201 reviews",
              description: "Discover Our TrustScore & Customer Reviews",
            },
            buttonText: "Enroll Now",
            buttonUrl: "/admission",
          };
        }

        if (p === "trusted-brands") {
          return {
            title: "Accreditations, Memberships, and Recognitions",
            brands: [
              {
                image: "https://www.alrasheedacademy.org/images/Nysed-seal.png",
                description:
                  "University of the State of New York Education Department Board of Regents",
                alt: "NYSED Seal",
              },
              {
                image:
                  "https://www.alrasheedacademy.org/images/Logo-Long-Revised-1-2048x564.png",
                description: "The Council of Islamic Schools",
                alt: "Logo Long Revised",
              },
              {
                image:
                  "https://www.alrasheedacademy.org/images/cognia-white-500-400x108.png",
                description: "Cognia Accreditation Organization",
                alt: "COGNIA",
              },
            ],
            buttonText: "View All Accreditations",
            buttonUrl: "/accreditations",
          };
        }

        if (p === "affiliations") {
          return {
            title: "Affiliation.",
            subtitle: "Used by the leaders.",
            showSubtitle: false,
            logos: [
              {
                id: "retool",
                image:
                  "https://www.alrasheedacademy.org/images/Untitled-wqqwqwe.png",
                alt: "Retool",
              },
              {
                id: "vercel",
                image:
                  "https://www.alrasheedacademy.org/images/Untitled-qw.png",
                alt: "Vercel",
              },
              {
                id: "remote",
                image:
                  "https://www.alrasheedacademy.org/images/Untitled-wqe.png",
                alt: "Remote",
              },
              {
                id: "arc",
                image:
                  "https://cmsv2-assets.apptegy.net/uploads/9227/logo/10529/logo-web.png",
                alt: "Arc",
              },
              {
                id: "raycast",
                image:
                  "https://www.alrasheedacademy.org/images/District%20Logo.png",
                alt: "Raycast",
              },
            ],
            sparklesConfig: {
              density: 1200,
              color: "#8350e8",
            },
          };
        }

        if (p === "character-cards") {
          return {
            mainTitle: "Our Core Values",
            subtitle: "Building character, compassion, and community at ARA",
            cards: [
              {
                id: "character",
                title: "Character",
                description:
                  "Character development, a fundamental aspect of ARA's vision, is consciously refined through deliberate actions and activities within and beyond the classroom. This dedication is seamlessly integrated into our daily academic curriculum, aiming to impart not only subject matter expertise but also instill the virtues of honesty, compassion, and perseverance.",
              },
              {
                id: "compassion",
                title: "Compassion",
                description:
                  "Compassion development, a fundamental aspect of ARA's vision, is consciously refined through deliberate actions and activities within and beyond the classroom. This dedication is seamlessly integrated into our daily academic curriculum, aiming to impart not only subject matter expertise but also instill the virtues of empathy, kindness, and understanding.",
              },
              {
                id: "community",
                title: "Community",
                description:
                  "Emphasizing the community as an interdependent member encapsulates ARA's initiative to foster educational excellence and meaningful faith within a diverse and caring environment. aiming to impart not only subject matter expertise but also instill the virtues of empathy, kindness, and understanding as independent members of a larger community.",
              },
            ],
          };
        }

        if (p === "bento-grid") {
          return {
            mainTitle: "Our Features & Programs",
            subtitle: "Discover what makes ARA Academy exceptional",
            features: [
              {
                name: "Admissions",
                description:
                  "Learn about our admission process, requirements, and how to join our vibrant school community.",
                href: "/",
                cta: "Apply Now",
                backgroundImage:
                  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
                className:
                  "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
                icon: "UserPlus",
                isActive: true,
              },
              {
                name: "Islamic Education",
                description:
                  "Comprehensive Islamic studies program integrating faith, knowledge, and character development.",
                href: "/",
                cta: "Learn more",
                backgroundImage:
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
                className:
                  "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
                icon: "BookOpen",
                isActive: true,
              },
              {
                name: "College Preparatory",
                description:
                  "Rigorous academic preparation and guidance to help students succeed in higher education.",
                href: "/",
                cta: "Learn more",
                backgroundImage:
                  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop",
                className:
                  "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
                icon: "GraduationCap",
                isActive: true,
              },
              {
                name: "Latest News",
                description:
                  "Stay updated with school announcements, events, achievements, and community news.",
                href: "/latest-news",
                cta: "Read More",
                backgroundImage:
                  "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=800&h=600&fit=crop",
                className:
                  "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
                icon: "Newspaper",
                isActive: true,
              },
              {
                name: "Academics",
                description:
                  "Explore our comprehensive curriculum, subjects, and academic programs designed for excellence.",
                href: "/curricular",
                cta: "Learn more",
                backgroundImage:
                  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop",
                className:
                  "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
                icon: "BookOpen",
                isActive: true,
              },
              {
                name: "Career",
                description:
                  "Career guidance, counseling, and preparation for future professional success and lifelong learning.",
                href: "/",
                cta: "Explore Careers",
                backgroundImage:
                  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop",
                className:
                  "lg:col-start-1 lg:col-end-4 lg:row-start-4 lg:row-end-5",
                icon: "Briefcase",
                isActive: true,
              },
            ],
          };
        }

        if (p === "dress-code") {
          return {
            // Banner Section
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "Dress Code",
              breadcrumb: "Home › Dress Code",
            },
            // Hero Section
            hero: {
              title: "AL-RASHEED ACADEMY",
              subtitle: "Established in Excellence",
              description:
                "Creating unity, responsibility, and a positive learning environment through proper attire. Your cooperation ensures our students are prepared for success every day.",
              logoImages: [
                "https://www.alrasheedacademy.org/images/Untitled-1.png",
                "https://www.alrasheedacademy.org/images/Untitled-2.png",
                "https://www.alrasheedacademy.org/images/qqdd.png",
                "https://www.alrasheedacademy.org/images/48999.png",
                "https://www.alrasheedacademy.org/images/1333.png",
                "https://www.alrasheedacademy.org/images/Untitled-13.png",
                "https://www.alrasheedacademy.org/images/Untitled-12.png",
                "https://www.alrasheedacademy.org/images/Untitled-6.png",
                "https://www.alrasheedacademy.org/images/qqq.png",
                "https://www.alrasheedacademy.org/images/Untitled-9.png",
                "https://www.alrasheedacademy.org/images/7788.png",
                "https://www.alrasheedacademy.org/images/Untitled-11.png",
                "https://www.alrasheedacademy.org/images/Untitled-10.png",
                "https://www.alrasheedacademy.org/images/Untitled-1qwe.png",
                "https://www.alrasheedacademy.org/images/qw.png",
              ],
            },
            // Key Information Cards
            infoCards: [
              {
                icon: "ShirtIcon",
                title: "Daily Uniform",
                description: "Required every school day for all students",
                isActive: true,
              },
              {
                icon: "Calendar",
                title: "Gym Days",
                description: "Special uniform for PE and outdoor activities",
                isActive: true,
              },
              {
                icon: "CheckCircle2",
                title: "Compliance",
                description: "Full uniform required upon entry to school",
                isActive: true,
              },
            ],
            // Important Notice
            notice: {
              title: "Dress Code Violations Policy",
              content: [
                "Parent Responsibility: Parents are responsible for ensuring their child leaves home in full uniform each day.",
                "School Entry: Students must enter school premises fully uniformed. Students not in proper uniform will not be admitted.",
                "Consequences: If a student arrives without proper uniform, parents must bring the uniform or the student will receive after-school detention.",
                "Repeated Violations: Continued violations will result in suspension until a parent conference is held.",
              ],
            },
            // Uniform Requirements
            uniforms: {
              daily: {
                title: "Uniform Requirements",
                subtitle: "Complete dress code guidelines by grade level",
                description:
                  "Every student must wear the required daily uniform every day. Both boys and girls may wear uniform sweaters or fleece jackets/vests as optional layers.",
                gymPolicy:
                  "Gym uniforms are worn ONLY on gym, games, and field trip days. Girls 4th grade and up may wear gym uniforms under their abayas.",
                gradeSections: [
                  {
                    grade: "K-3rd Grade",
                    items: [
                      "Navy Blue uniform dresses with Navy Blue pants",
                      "Maroon collared shirts",
                      "Maroon Hijab",
                    ],
                    image: "/assets/12grade.png",
                    isActive: true,
                  },
                  {
                    grade: "4th-12th Grade",
                    items: [
                      "Black Abaya (with no design)",
                      "Maroon Hijab",
                      "Black or white socks",
                      "Black Cardigans/Button down (no zippers or hoods allowed)",
                    ],
                    image: "/assets/hijabblack.png",
                    isActive: true,
                  },
                  {
                    grade: "All Grades",
                    items: [
                      "School uniform colors by school level",
                      "Navy Blue Hijab",
                      "Black or white socks",
                      "Navy Blue Uniform Sweaters/Button down (no zippers or hoods)",
                    ],
                    images: [
                      "/assets/kgpant.png",
                      "/assets/shoe.png",
                      "/assets/kgthr12Pant.png",
                    ],
                    imageLabels: ["Elementary", "School Shoes", "High School"],
                    isActive: true,
                  },
                ],
              },
              gym: {
                title: "Physical Education Uniform",
                subtitle:
                  "Appropriate athletic wear for gym class, games, and outdoor activities",
                notice: "Black sneakers are required for all gym classes",
                boys: [
                  "T-shirt (no design)",
                  "Baggy sweatpants",
                  "Black sneakers",
                ],
                girls: [
                  "Long sleeve t-shirt (no design)",
                  "Baggy sweatpants",
                  "Black sneakers",
                ],
              },
            },
            // Contact Section
            contact: {
              title: "Need Assistance?",
              description:
                "Our office staff is available to answer any questions about dress code requirements",
              phone: "(716) 706-1303",
              email: "registration@alrasheed.edu",
            },
          };
        }

        if (p === "bus-policy") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "Bus Policy",
              breadcrumb: "Home › Bus Policy",
            },
            content: {
              introduction: "Our bus transportation policy ensures the safety and well-being of all students.",
              sections: [
                {
                  title: "Bus Safety Rules",
                  content: "All students must follow safety rules while on the bus.",
                },
                {
                  title: "Boarding and Dismissal",
                  content: "Students should arrive on time and board the bus in an orderly manner.",
                },
                {
                  title: "Conduct on Bus",
                  content: "Students are expected to behave respectfully and cooperatively.",
                },
              ],
            },
          };
        }

        if (p === "footer") {
          return {
            company: {
              name: "Al-Rasheed Academy",
              description:
                "Excellence in Islamic Education. Accredited by New York State Education Department, providing quality K-12 education with Islamic values.",
              logo: "/logo.png",
            },
            socialLinks: [
              {
                label: "Facebook",
                href: "https://facebook.com/alrasheedacademy",
                icon: "Facebook",
              },
              {
                label: "Instagram",
                href: "https://instagram.com/alrasheedacademy",
                icon: "Instagram",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/alrasheedacademy",
                icon: "Twitter",
              },
              {
                label: "GitHub",
                href: "https://github.com/alrasheedacademy",
                icon: "Github",
              },
              {
                label: "Dribbble",
                href: "https://dribbble.com/alrasheedacademy",
                icon: "Dribbble",
              },
            ],
            aboutLinks: [
              { text: "Our History", href: "/about/history" },
              { text: "Faculty & Staff", href: "/about/faculty" },
              { text: "Mission & Vision", href: "/about/mission" },
              { text: "Careers", href: "/careers" },
            ],
            serviceLinks: [
              { text: "Admission", href: "/admission" },
              { text: "Learning Programs", href: "/learning" },
              { text: "Accreditation", href: "/accreditation" },
              { text: "Career Services", href: "/career" },
            ],
            helpfulLinks: [
              { text: "FAQs", href: "/faqs" },
              { text: "Student Support", href: "/support" },
              { text: "Contact Us", href: "/contact", hasIndicator: true },
            ],
            contactInfo: [
              {
                text: "info@alrasheedacademy.org",
                icon: "Mail",
                isAddress: false,
              },
              { text: "+1(716) 822-0440", icon: "Phone", isAddress: false },
              {
                text: "3122 Abbott Road Orchard Park, New York 14127",
                icon: "MapPin",
                isAddress: true,
              },
            ],
          };
        }

        if (p === "supply-list") {
          return [
            {
              grade: "Kindergarten",
              color: "pink",
              items: [
                "1 primary journal for writing",
                "1 full-size backpack",
                "12 packs of #2 pencils",
                "2 pink erasers",
                "4 dry erase markers",
                "1 small dry erase board with eraser",
                "1 Crayola Washable Paint/10 ct. 2oz",
                "1 washable crayola markers",
                "24 box of Crayola crayons",
                "2-4 oz bottle of Elmer's glue",
                "1 package-colored pencils",
                "1 scissor (blunt-tip)",
                "1 pack of index cards",
                "1 painting smock",
                "1 plastic pencil box",
                "2 transparent scotch tapes",
                "1 pack of construction paper",
                "3 large boxes of tissues",
                "3 packages of antibacterial wipes",
                "3 rolls of paper towels",
                "1 complete set of clothes (left at school)",
                "1 pack of gallon Ziploc bags",
              ],
            },
            {
              grade: "1st Grade",
              color: "indigo",
              items: [
                "1 full-size backpack",
                "5 composition notebooks (different colors)",
                "5 plastic double pocket folders",
                "3 packages of printer paper",
                "24 #2 sharpened pencils",
                "1 package markers",
                "1 package dry erase markers",
                "2 pink erasers",
                "1 package-colored pencils",
                "1 scissor (blunt-tip)",
                "4 glue sticks",
                "1 4-oz bottle white glue",
                "1 pack of construction paper",
                "1 Agenda",
                "3 rolls of paper towels",
                "3 Klenex tissue boxes",
                "3 antibacterial 75ct wipes",
                "1 pack of sandwich lock bags",
              ],
            },
            {
              grade: "2nd & 3rd Grade",
              color: "green",
              items: [
                "1 full-size backpack",
                "5 composition notebooks (different colors)",
                "5 plastic double pocket folders",
                "3 packages of printer paper",
                "24-36 #2 sharpened pencils",
                "1 package markers",
                "1 package dry erase markers",
                "2 pink erasers",
                "1 package-colored pencils",
                "1 scissor (blunt-tip)",
                "4 glue sticks",
                "1 4-oz bottle white glue",
                "1 plastic pencil box",
                "2 transparent scotch tapes",
                "1 pack of construction paper",
                "1 Agenda",
                "3 rolls paper towels",
                "3 Klenex tissue boxes",
                "3 antibacterial 75ct wipes",
                "1 package 3x5 index cards",
              ],
            },
            {
              grade: "4th Grade",
              color: "yellow",
              items: [
                "1 full-size backpack",
                "6 composition notebooks",
                "5 plastic double pocket folders",
                "3 packages of printer paper",
                "4 packs #2 sharpened pencils",
                "1 pack of colored pencils",
                "1 package dry erase markers",
                "2 pink erasers",
                "1 scissor (blunt-tip)",
                "4 glue sticks",
                "1 plastic pencil box",
                "2 transparent scotch tapes",
                "1 package 3x5 index cards",
                "3 rolls paper towels",
                "3 Klenex tissue boxes",
                "3 antibacterial 75ct wipes",
              ],
            },
            {
              grade: "5th & 6th Grade",
              color: "purple",
              items: [
                "1 full-size backpack",
                "7 composition notebooks (different colors)",
                "5 plastic double pocket folders",
                "3 packages of printer paper",
                "4 packs #2 sharpened pencils",
                "1 pack of colored pencils",
                "1 package dry erase markers",
                "2 pink erasers",
                "1 scissor (blunt-tip)",
                "4 glue sticks",
                "1 4-oz bottle white glue",
                "1 plastic pencil box",
                "2 transparent scotch tapes",
                "1 package 3x5 index cards",
                "1 scientific calculator (6th Grade)",
                "3 rolls paper towels",
                "3 Klenex tissue boxes",
                "3 antibacterial 75ct wipes",
              ],
            },
            {
              grade: "7th & 8th Grade",
              color: "teal",
              items: [
                "1 full-size backpack",
                "7 composition notebooks (different colors)",
                "5 plastic double pocket folders",
                "3 packages of printer paper",
                "4 packs #2 sharpened pencils",
                "1 package markers",
                "1 box of crayons",
                "1 Personal dry erase board",
                "1 package dry erase markers",
                "2 pink erasers",
                "1 package colored pencils",
                "1 scissor (blunt-tip)",
                "4 glue sticks",
                "1 4-oz bottle white glue",
                "1 plastic pencil box",
                "2 transparent scotch tapes",
                "1 pack construction paper",
                "1 package 3x5 index cards",
                "1 Protractor",
                "1 Ruler",
                "3 rolls paper towels",
                "3 Klenex tissue boxes",
                "3 antibacterial 75ct wipes",
              ],
            },
            {
              grade: "9th-11th Grade",
              color: "red",
              items: [
                "1 pack of Graphing Paper",
                "3-3 subject notebooks",
                "3 composition notebooks",
                "2 Pack of loose-Leaf Paper (Wide-Ruled)",
                "7 Plastic Double-Pocket Folders with Prong (1 of each color)",
                "1 Pack of Cardstock paper",
                "3 Packages of Printing Paper",
                "2 packs of #2 pencils",
                "2 Pink erasers",
                "1 Pack of Pens (blue, black & red)",
                "4 dry erase markers (broad with eraser)",
                "1 Pack of Markers",
                "2 Highlighters",
                "1 4oz bottle of glue",
                "1 Pair of Scissors",
                "1 Compass",
                "1 Clear Protractor",
                "1 Sharpener",
                "1 Pack of colored printing paper",
                "1 Pencil case/pouch",
                "12-Inch Ruler (Metric and inches)",
                "3 Transparent scotch tape",
                "1 Calculator Graphing",
                "3 rolls paper towels",
                "3 Klenex tissue",
                "3 antibacterial 75ct wipes",
              ],
            },
          ];
        }

        if (p === "college-preparatory") {
          return {
            banner: {
              backgroundImage: "/assets/hall.jpg",
              title: "College Preparatory",
              breadcrumb: "Home › College Preparatory",
            },
            header: {
              description:
                "ARA school guides students and their families through the college planning and application process. Topics covered include College Application, Financial Aid Application (FAFSA), Common App, Resume Design and Letters of Recommendation.",
            },
            hero: {
              image:
                "https://images.unsplash.com/photo-1760605193118-a3536e1eea61?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
              imageAlt:
                "Our Students During Their Participation in the College Fair!",
              description:
                "ARA Academy School's college guidance program helps students navigate every step of their path to college, including:",
              programFeatures: [
                {
                  title: "Guidance:",
                  description:
                    "Course selection guidance, Career Day, job shadowing, Resume",
                },
                {
                  title: "Standardized testing:",
                  description: "SAT",
                },
                {
                  title: "College selection:",
                  description: "college visits and individual college guidance",
                },
                {
                  title: "College planning resources:",
                  description:
                    "Free Application for Federal Student Aid (FAFSA), Common Application, and more!",
                },
              ],
            },
            universities: {
              title:
                "Our Graduates Have Been Accepted at the Following Universities",
              logos: [
                "/assets/1.png",
                "/assets/2.png",
                "/assets/3.png",
                "/assets/4.png",
                "/assets/5.png",
                "/assets/6.png",
                "/assets/7.png",
                "/assets/8.png",
                "/assets/9.png",
                "/assets/10.png",
                "/assets/11.png",
                "/assets/12.png",
                "/assets/13.png",
              ],
              autoPlayInterval: 2000,
            },
          };
        }

        if (p === "islamic-studies") {
          return {
            slides: [
              {
                img: "/assets/istudies_1.png",
                heading:
                  "Islamic Studies at Al-Rasheed Academy: Embracing Faith and Knowledge",
                text: "At Al-Rasheed Academy, we understand the significance of providing a well-rounded education that encompasses both academic excellence and spiritual development. Our commitment to nurturing the whole child extends to the implementation of our Islamic Studies curriculum, which plays a vital role in shaping the character and values of our students.",
              },
              {
                img: "/assets/istudies_2.png",
                heading: "Integration of Islamic Values",
                text: "Our Islamic Studies curriculum is designed to instill a deep understanding of Islamic principles, values, and traditions. By integrating these teachings into our daily lessons, we aim to foster an environment where students not only excel academically but also develop a strong moral compass rooted in Islamic ethics.",
              },
              {
                img: "/assets/istudies_3.png",
                heading: "Quranic Studies",
                text: "The study of the Quran is at the heart of our Islamic Studies program. Students engage in the recitation and memorization of Quranic verses, gaining a profound connection with the holy book. We emphasize the importance of understanding the meanings and teachings of the Quran, empowering students to apply its principles to their lives.",
              },
              {
                img: "/assets/istudies_4.png",
                heading: "Prophet's Life and Sunnah",
                text: "Our curriculum includes an exploration of the life and teachings of Prophet Muhammad (peace be upon him) and the importance of following the Sunnah. Through engaging lessons, students learn about the Prophet's exemplary character, compassion, and leadership, providing them with role models to emulate in their daily lives.",
              },
              {
                img: "/assets/istudies_5.png",
                heading: "Islamic History and Civilization",
                text: "We delve into the rich history and contributions of Islamic civilizations, fostering an appreciation for the cultural and intellectual achievements of the Islamic world. Students gain a broader perspective on the global impact of Islamic societies throughout history.",
              },
              {
                img: "/assets/istudies_6.png",
                heading: "Community and Service Learning",
                text: "As part of our commitment to instilling a sense of social responsibility, students actively participate in community service projects grounded in Islamic values. These experiences provide practical opportunities for students to embody compassion, generosity, and empathy, reflecting the teachings of Islam.",
              },
              {
                img: "/assets/istudies_7.png",
                heading: "Family Involvement",
                text: "We recognize the importance of a collaborative approach to education. Parents are encouraged to be active participants in their child's learning journey, especially in reinforcing Islamic values at home. Our school community thrives on open communication and partnership to ensure the holistic development of each student. At Al-Rasheed Academy, the Islamic Studies curriculum serves as a cornerstone, guiding students on a path of spiritual growth and academic success. We believe that a strong foundation in Islamic principles, coupled with a rigorous academic program, prepares our students to navigate the challenges of the modern world while upholding the values of compassion, integrity, and service to humanity.",
              },
            ],
          };
        }

        if (p === "curricular") {
          return {
            sections: [
              {
                title: "Common Core Standards",
                subTitle: null,
                imageSrc: "/assets/common.png",
                imageAlt: "Common Core State Standards Initiative logo",
                content:
                  "Al-Rasheed Academy aligns its curriculum with the Common Core Standards, a set of rigorous and internationally benchmarked guidelines that ensure students develop essential skills in English Language Arts (ELA) and mathematics. By incorporating these standards into our teaching methods, we empower our students to think critically, communicate effectively, and solve complex problems—skills that are crucial for success in the 21st century.",
                reverse: false,
                accent: "#0ea5a4",
              },
              {
                title: "EngageNY Mathematics",
                subTitle: "Our Students. Their Moment.",
                imageSrc: "/assets/engage.png",
                imageAlt: "EngageNY logo",
                content:
                  "We are proud to implement the Engage New York curriculum in our mathematics program. This curriculum emphasizes a deep understanding of mathematical concepts, fostering a love for problem-solving and critical thinking. Through hands-on activities, real-world applications, and a focus on mathematical reasoning, our students not only master mathematical skills but also develop a genuine appreciation for the beauty and relevance of mathematics in their everyday lives.",
                reverse: true,
                accent: "#b87333",
              },
              {
                title: "Making Sense of SCIENCE",
                subTitle: null,
                imageSrc: "/assets/making_sense.png",
                imageAlt: "Making Sense of Science logo",
                content:
                  "In our commitment to providing a comprehensive education, Al-Rasheed Academy incorporates the Next Generation Science Standards (NGSS). These standards guide our science curriculum, encouraging students to explore scientific concepts through inquiry-based learning, hands-on experiments, and collaborative projects. By engaging in the scientific process, our students develop a curiosity for the world around them and acquire the skills needed to succeed in an increasingly STEM-driven society.",
                reverse: false,
                accent: "#6b4226",
              },
            ],
          };
        }
      };

      const defaults = getDefaultCmsContent(page);
      if (defaults) {
        return res.json(defaults);
      }

      return res.status(404).json({ error: "CMS content not found" });
    }

    // If CMS content exists, return it but ensure defaults for missing fields
    let responseContent = cms.content || {};

    // For administration page, ensure members array has defaults if empty
    if (page === "administration") {
      const defaultMembers = [
        {
          name: "Anwar Al-Kalai",
          role: "School Principal",
          avatar:
            "https://www.alrasheedacademy.org/Admin/images/26a478f08fa3204098346fcbcdbfc2831758763720jpeg",
          link: "#",
        },
        {
          name: "Ahmed Nada",
          role: "Academic Director",
          avatar:
            "https://www.alrasheedacademy.org/Admin/images/289648f191687d568b74a00ccd76f3771758763603.png",
          link: "#",
        },
        {
          name: "Abdullah Mardaie",
          role: "Office Manager",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "#",
        },
      ];

      responseContent = {
        banner: responseContent.banner || {
          backgroundImage: "/assets/hall.jpg",
          title: "General Administration",
          breadcrumb: "Home › Administration",
        },
        members:
          !Array.isArray(responseContent.members) ||
          responseContent.members.length === 0
            ? defaultMembers
            : responseContent.members,
      };
    }

    // For k3-faculty page, ensure members array has defaults if empty
    if (page === "k3-faculty") {
      const defaultMembers = [
        {
          name: "Kafaih Abdallah",
          role: "Admin Asst",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:kabdallah@alrasheedacademy.org",
        },
        {
          name: "Fatima Faadel",
          role: "Quran Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:ffaadel@alrasheedacademy.org",
        },
        {
          name: "Nusrah Ali",
          role: "Religious Teacher",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:nali@alrasheedacademy.org",
        },
        {
          name: "Ammarah Gaber",
          role: "1st Grade Homeroom Teacher",
          avatar: "https://alt.tailus.io/images/team/member-four.webp",
          link: "mailto:agaber@alrasheedacademy.org",
        },
        {
          name: "Asma Zaied",
          role: "1st Grade Homeroom Teacher",
          avatar: "https://alt.tailus.io/images/team/member-five.webp",
          link: "mailto:azaied@alrasheedacademy.org",
        },
        {
          name: "Sumaya Nasser",
          role: "2nd Grade Homeroom Teacher",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:snasser@alrasheedacademy.org",
        },
        {
          name: "Alaa Abadi",
          role: "2nd Grade Homeroom Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:aabadi@alrasheedacademy.org",
        },
        {
          name: "Ayih Elbaneh",
          role: "3rd Grade Homeroom Teacher",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:aelbaneh@alrasheedacademy.org",
        },
        {
          name: "Nathar Eloudi",
          role: "3rd Grade Homeroom Teacher",
          avatar: "https://alt.tailus.io/images/team/member-four.webp",
          link: "mailto:neloudi@alrasheedacademy.org",
        },
      ];

      responseContent = {
        banner: responseContent.banner || {
          backgroundImage: "/assets/hall.jpg",
          title: "K-3 Section Faculty",
          breadcrumb: "Home › K-3 Faculty",
        },
        members:
          !Array.isArray(responseContent.members) ||
          responseContent.members.length === 0
            ? defaultMembers
            : responseContent.members,
      };
    }

    // For boys-faculty page, ensure members array has defaults if empty
    if (page === "boys-faculty") {
      const defaultMembers = [
        {
          name: "Abdullah M Mardaie",
          role: "Administrator",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:amardaie@alrasheedacademy.org",
        },
        {
          name: "Walid Al Salahi",
          role: "Quran Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:aibrahim@alrasheedacademy.org",
        },
        {
          name: "Abdo M Fadhel",
          role: "Islamic Studies Teacher",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:afadhel@alrasheedacademy.org",
        },
        {
          name: "Mohamed A Mohamed",
          role: "Arabic Teacher",
          avatar: "https://alt.tailus.io/images/team/member-four.webp",
          link: "mailto:mmohamed@alrasheedacademy.org",
        },
        {
          name: "Yousif Ahmed",
          role: "Religious Teacher",
          avatar: "https://alt.tailus.io/images/team/member-five.webp",
          link: "mailto:yousifahmed@alrasheedacademy.org",
        },
        {
          name: "Yousif Fadhel",
          role: "Religious Teacher",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:yfadhel@alrasheedacademy.org",
        },
        {
          name: "Mohamed Al-Kalai",
          role: "GYM & Health Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:maalkalai@alrasheedacademy.org",
        },
        {
          name: "Rathwan G Ali",
          role: "ELA Teacher",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:rali@alrasheedacademy.org",
        },
        {
          name: "Magdi Ahmed",
          role: "Social Studies Teacher",
          avatar: "https://alt.tailus.io/images/team/member-four.webp",
          link: "mailto:mahmed@alrasheedacademy.org",
        },
        {
          name: "Nieal Alwan",
          role: "Science Teacher",
          avatar: "https://alt.tailus.io/images/team/member-five.webp",
          link: "mailto:nalwan@alrasheedacademy.org",
        },
        {
          name: "Hisham khelly",
          role: "Mathematics Teacher",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:hkhelly@alrasheedacademy.org",
        },
        {
          name: "Ahmed Mohamed",
          role: "Health/Gym Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:amohamed@alrasheedacademy.org",
        },
        {
          name: "Mohammad A Rahman",
          role: "Support Staff",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:mrahman@alrasheedacademy.org",
        },
      ];

      responseContent = {
        banner: responseContent.banner || {
          backgroundImage: "/assets/hall.jpg",
          title: "Boys' Section Faculty",
          breadcrumb: "Home › Boys Faculty",
        },
        members:
          !Array.isArray(responseContent.members) ||
          responseContent.members.length === 0
            ? defaultMembers
            : responseContent.members,
      };
    }

    // For girls-faculty page, ensure members array has defaults if empty
    if (page === "girls-faculty") {
      const defaultMembers = [
        {
          name: "Razan Abdulgalil",
          role: "Admin Asst",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:rabdulgalil@alrasheedacademy.org",
        },
        {
          name: "Muna Abdulla",
          role: "Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:mabdulla@alrasheedacademy.org",
        },
        {
          name: "Yasmeen Fadel",
          role: "Religious Teacher",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:yasmeen_fadel@alrasheedacademy.org",
        },
        {
          name: "Loula Ali",
          role: "Religious Teacher",
          avatar: "https://alt.tailus.io/images/team/member-four.webp",
          link: "mailto:lali@alrasheedacademy.org",
        },
        {
          name: "Nora Mohamed",
          role: "Teacher",
          avatar: "https://alt.tailus.io/images/team/member-five.webp",
          link: "mailto:noramohamed@alrasheedacademy.org",
        },
        {
          name: "Hudda Al-Kalai",
          role: "4th & 5th Grade Teacher",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:halkalai@alrasheedacademy.org",
        },
        {
          name: "Kemah Freeman",
          role: "Social Studies Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:kfreeman@alrasheedacademy.org",
        },
        {
          name: "Aseel Fadhil",
          role: "Science Teacher",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:afadhil@alrasheedacademy.org",
        },
        {
          name: "Zayba Yasin",
          role: "Mathematics Teacher",
          avatar: "https://alt.tailus.io/images/team/member-four.webp",
          link: "mailto:zyasin@alrasheedacademy.org",
        },
        {
          name: "Fatima Mohamed",
          role: "Mathematics Teacher",
          avatar: "https://alt.tailus.io/images/team/member-five.webp",
          link: "mailto:ffaadel@alrasheedacademy.org",
        },
        {
          name: "Kawlah A Al-Kalai",
          role: "ELA Teacher",
          avatar: "https://alt.tailus.io/images/team/member-one.webp",
          link: "mailto:kalkalai@alrasheedacademy.org",
        },
        {
          name: "Amira Mohamed",
          role: "Health/Gym Teacher",
          avatar: "https://alt.tailus.io/images/team/member-two.webp",
          link: "mailto:amiramohamed@alrasheedacademy.org",
        },
        {
          name: "Asma Nashwan",
          role: "Teacher",
          avatar: "https://alt.tailus.io/images/team/member-three.webp",
          link: "mailto:anashwan@alrasheedacademy.org",
        },
        {
          name: "Raheq Abdulla",
          role: "Islamic Studies Teacher",
          avatar: "https://alt.tailus.io/images/team/member-four.webp",
          link: "mailto:Sali@alrasheedacademy.org",
        },
      ];

      responseContent = {
        banner: responseContent.banner || {
          backgroundImage: "/assets/hall.jpg",
          title: "Girls' Section Faculty",
          breadcrumb: "Home › Girls Faculty",
        },
        members:
          !Array.isArray(responseContent.members) ||
          responseContent.members.length === 0
            ? defaultMembers
            : responseContent.members,
      };
    }

    // For islamic-studies page, ensure slides array has defaults if empty
    if (page === "islamic-studies") {
      const defaultSlides = [
        {
          img: "/assets/istudies_1.png",
          heading:
            "Islamic Studies at Al-Rasheed Academy: Embracing Faith and Knowledge",
          text: "At Al-Rasheed Academy, we understand the significance of providing a well-rounded education that encompasses both academic excellence and spiritual development. Our commitment to nurturing the whole child extends to the implementation of our Islamic Studies curriculum, which plays a vital role in shaping the character and values of our students.",
        },
        {
          img: "/assets/istudies_2.png",
          heading: "Integration of Islamic Values",
          text: "Our Islamic Studies curriculum is designed to instill a deep understanding of Islamic principles, values, and traditions. By integrating these teachings into our daily lessons, we aim to foster an environment where students not only excel academically but also develop a strong moral compass rooted in Islamic ethics.",
        },
        {
          img: "/assets/istudies_3.png",
          heading: "Quranic Studies",
          text: "The study of the Quran is at the heart of our Islamic Studies program. Students engage in the recitation and memorization of Quranic verses, gaining a profound connection with the holy book. We emphasize the importance of understanding the meanings and teachings of the Quran, empowering students to apply its principles to their lives.",
        },
        {
          img: "/assets/istudies_4.png",
          heading: "Prophet's Life and Sunnah",
          text: "Our curriculum includes an exploration of the life and teachings of Prophet Muhammad (peace be upon him) and the importance of following the Sunnah. Through engaging lessons, students learn about the Prophet's exemplary character, compassion, and leadership, providing them with role models to emulate in their daily lives.",
        },
        {
          img: "/assets/istudies_5.png",
          heading: "Islamic History and Civilization",
          text: "We delve into the rich history and contributions of Islamic civilizations, fostering an appreciation for the cultural and intellectual achievements of the Islamic world. Students gain a broader perspective on the global impact of Islamic societies throughout history.",
        },
        {
          img: "/assets/istudies_6.png",
          heading: "Community and Service Learning",
          text: "As part of our commitment to instilling a sense of social responsibility, students actively participate in community service projects grounded in Islamic values. These experiences provide practical opportunities for students to embody compassion, generosity, and empathy, reflecting the teachings of Islam.",
        },
        {
          img: "/assets/istudies_7.png",
          heading: "Family Involvement",
          text: "We recognize the importance of a collaborative approach to education. Parents are encouraged to be active participants in their child's learning journey, especially in reinforcing Islamic values at home. Our school community thrives on open communication and partnership to ensure the holistic development of each student. At Al-Rasheed Academy, the Islamic Studies curriculum serves as a cornerstone, guiding students on a path of spiritual growth and academic success. We believe that a strong foundation in Islamic principles, coupled with a rigorous academic program, prepares our students to navigate the challenges of the modern world while upholding the values of compassion, integrity, and service to humanity.",
        },
      ];

      responseContent = {
        slides:
          !Array.isArray(responseContent.slides) ||
          responseContent.slides.length === 0
            ? defaultSlides
            : responseContent.slides,
      };
    }

    // For curricular page, ensure sections array has defaults if empty
    if (page === "curricular") {
      const defaultSections = [
        {
          title: "Common Core Standards",
          subTitle: null,
          imageSrc: "/assets/common.png",
          imageAlt: "Common Core State Standards Initiative logo",
          content:
            "Al-Rasheed Academy aligns its curriculum with the Common Core Standards, a set of rigorous and internationally benchmarked guidelines that ensure students develop essential skills in English Language Arts (ELA) and mathematics. By incorporating these standards into our teaching methods, we empower our students to think critically, communicate effectively, and solve complex problems—skills that are crucial for success in the 21st century.",
          reverse: false,
          accent: "#0ea5a4",
        },
        {
          title: "EngageNY Mathematics",
          subTitle: "Our Students. Their Moment.",
          imageSrc: "/assets/engage.png",
          imageAlt: "EngageNY logo",
          content:
            "We are proud to implement the Engage New York curriculum in our mathematics program. This curriculum emphasizes a deep understanding of mathematical concepts, fostering a love for problem-solving and critical thinking. Through hands-on activities, real-world applications, and a focus on mathematical reasoning, our students not only master mathematical skills but also develop a genuine appreciation for the beauty and relevance of mathematics in their everyday lives.",
          reverse: true,
          accent: "#b87333",
        },
        {
          title: "Making Sense of SCIENCE",
          subTitle: null,
          imageSrc: "/assets/making_sense.png",
          imageAlt: "Making Sense of Science logo",
          content:
            "In our commitment to providing a comprehensive education, Al-Rasheed Academy incorporates the Next Generation Science Standards (NGSS). These standards guide our science curriculum, encouraging students to explore scientific concepts through inquiry-based learning, hands-on experiments, and collaborative projects. By engaging in the scientific process, our students develop a curiosity for the world around them and acquire the skills needed to succeed in an increasingly STEM-driven society.",
          reverse: false,
          accent: "#6b4226",
        },
      ];

      responseContent = {
        sections:
          !Array.isArray(responseContent.sections) ||
          responseContent.sections.length === 0
            ? defaultSections
            : responseContent.sections,
      };
    }

    res.json(responseContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/cms/:page - Update CMS content for a page (admin only)
router.put("/cms/:page", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    const { page } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });

    const cms = await CMS.findOneAndUpdate(
      { page },
      { $set: { content, page } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/cms/trusted-brands - Update trusted brands CMS content (admin only)
router.post("/cms/trusted-brands", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const trustedBrandsData = req.body;
    if (!trustedBrandsData)
      return res.status(400).json({ error: "Trusted Brands data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "trusted-brands" },
      { $set: { content: trustedBrandsData, page: "trusted-brands" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/cms/affiliations - Update affiliations CMS content (admin only)
router.post("/cms/affiliations", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const affiliationsData = req.body;
    if (!affiliationsData)
      return res.status(400).json({ error: "Affiliations data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "affiliations" },
      { $set: { content: affiliationsData, page: "affiliations" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/cms/character-cards - Update character cards CMS content (admin only)
router.post("/cms/character-cards", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const characterCardsData = req.body;
    if (!characterCardsData)
      return res
        .status(400)
        .json({ error: "Character cards data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "character-cards" },
      { $set: { content: characterCardsData, page: "character-cards" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/cms/bento-grid - Update bento grid CMS content (admin only)
router.post("/cms/bento-grid", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const bentoGridData = req.body;
    if (!bentoGridData)
      return res.status(400).json({ error: "Bento grid data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "bento-grid" },
      { $set: { content: bentoGridData, page: "bento-grid" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/cms/dress-code - Update dress code CMS content (admin only)
router.post("/cms/dress-code", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const dressCodeData = req.body;
    if (!dressCodeData)
      return res.status(400).json({ error: "Dress code data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "dress-code" },
      { $set: { content: dressCodeData, page: "dress-code" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/cms/bus-policy - Update bus policy CMS content (admin only)
router.put("/cms/bus-policy", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const busPolicyData = req.body;
    if (!busPolicyData)
      return res.status(400).json({ error: "Bus policy data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "bus-policy" },
      { $set: { content: busPolicyData, page: "bus-policy" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/cms/supply-list - Update supply list CMS content (admin only)
router.put("/cms/supply-list", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const supplyListData = req.body;
    if (!supplyListData)
      return res.status(400).json({ error: "Supply list data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "supply-list" },
      { $set: { content: supplyListData, page: "supply-list" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/cms/college-preparatory - Update college preparatory CMS content (admin only)
router.post("/cms/college-preparatory", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const collegePreparatoryData = req.body;
    if (!collegePreparatoryData)
      return res
        .status(400)
        .json({ error: "College preparatory data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "college-preparatory" },
      {
        $set: { content: collegePreparatoryData, page: "college-preparatory" },
      },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/cms/islamic-studies - Update islamic studies CMS content (admin only)
router.put("/cms/islamic-studies", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { content } = req.body;
    if (!content)
      return res
        .status(400)
        .json({ error: "Islamic studies content is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "islamic-studies" },
      { $set: { content: content, page: "islamic-studies" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/cms/curricular - Update curricular CMS content (admin only)
router.put("/cms/curricular", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { content } = req.body;
    if (!content)
      return res.status(400).json({ error: "Curricular content is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "curricular" },
      { $set: { content: content, page: "curricular" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/cms/hero - Update hero CMS content (admin only)
router.post("/cms/hero", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const heroData = req.body;
    if (!heroData)
      return res.status(400).json({ error: "Hero data is required" });

    const cms = await CMS.findOneAndUpdate(
      { page: "hero" },
      { $set: { content: heroData, page: "hero" } },
      { upsert: true, new: true }
    );
    res.json(cms.content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
