import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

// Internal mocked DB
let gigs = [
  { id: "1", title: "Lead React Native Developer for Delivery MVP", description: "Looking for an experienced student developer to build the core mobile app for our funded campus delivery startup. Must be comfortable with Expo, Firebase, and state management.", budget: "₹40,000-₹80,000", tags: ["React Native", "Firebase", "TypeScript"], client: "Aarav M.", clientReputation: 4.8, date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), projectType: "Startup Project", duration: "1-3 months", applicants: 12, teamSizeNeeded: 2, workMode: "Hybrid" },
  { id: "2", title: "UI/UX Design for FinTech Dashboard", description: "Need a clean, modern dashboard design including dark mode for a student-led fintech project. Focus on beautiful data visualization and micro-interactions.", budget: "₹15,000-₹30,000", tags: ["Figma", "UI/UX", "Prototyping"], client: "Shruti K.", clientReputation: 4.9, date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), projectType: "Freelance Gig", duration: "1-4 weeks", applicants: 24, teamSizeNeeded: 1, workMode: "Remote" },
  { id: "3", title: "Machine Learning Engineer for Hackathon", description: "Looking for a last-minute ML expert to join our team for the upcoming university hackathon. We are building an AI study assistant.", budget: "Free", tags: ["Python", "TensorFlow", "OpenAI"], client: "Karan T.", clientReputation: 4.5, date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), projectType: "Hackathon", duration: "Less than 1 week", applicants: 3, teamSizeNeeded: 1, workMode: "On Campus" },
  { id: "4", title: "Social Media Manager Intern", description: "Fast-growing campus fashion brand needs a creative intern to handle TikTok and Instagram. Great opportunity for marketing students.", budget: "Internship", tags: ["Marketing", "Instagram", "Content"], client: "CampusVogue", clientReputation: 4.2, date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), projectType: "Internship", duration: "Long-term", applicants: 45, teamSizeNeeded: 1, workMode: "Remote" }
];

let projects = [
  { id: "p1", name: "Campus Ride Share App", description: "Building a ride-sharing app specifically for students. Looking for technical co-founders.", rolesNeeded: ["Backend Developer", "Mobile Engineer"], lead: "Dhruv K.", status: "Recruiting" },
  { id: "p2", name: "AI Study Assistant", description: "An open-source AI tutor trained on our university's computer science curriculum.", rolesNeeded: ["ML Engineer", "UI Designer"], lead: "Sneha R.", status: "In Progress" }
];

let users = [
  { id: "u1", name: "Dhruv K.", major: "Computer Science", skills: ["React", "Node.js", "Python"], reputation: 4.8 },
  { id: "u2", name: "Sneha R.", major: "Data Science", skills: ["Python", "TensorFlow", "SQL"], reputation: 4.9 },
  { id: "u3", name: "Karan J.", major: "Graphic Design", skills: ["Figma", "Illustrator", "UI/UX"], reputation: 4.5 }
];

async function startServer() {
  const PORT = 3000;
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // GIGS
  app.get("/api/gigs", (req, res) => {
    res.json(gigs);
  });
  
  app.post("/api/gigs", (req, res) => {
    const newGig = { id: Date.now().toString(), ...req.body, date: new Date().toISOString() };
    gigs.unshift(newGig);
    res.json(newGig);
  });

  // PROJECTS
  app.get("/api/projects", (req, res) => {
    res.json(projects);
  });

  // USERS
  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  // AI RECOMMENDATIONS
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured." });
      }
      
      const { profile, type } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      let prompt = "";
      if (type === "gigs") {
          prompt = `Given this student profile: ${JSON.stringify(profile)}, and these available gigs: ${JSON.stringify(gigs)}. Recommend the top 2 gigs and explain briefly why they match in a JSON array format like: [{"gigId": "1", "reason": "Matches your React skills."}]`;
      } else {
          prompt = `Given this student profile: ${JSON.stringify(profile)}, and these projects: ${JSON.stringify(projects)}. Recommend the top 2 projects to join and explain briefly why in a JSON array format like: [{"projectId": "p1", "reason": "They need a backend dev."}]`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      let recommendations = [];
      try {
        recommendations = JSON.parse(response.text || "[]");
      } catch (e) {
        console.error("Failed to parse AI response", e);
      }
      
      res.json(recommendations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate recommendations." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
