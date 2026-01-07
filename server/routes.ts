import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { analyzeMoodEntry } from "./openai";
import { insertMoodEntrySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/logout", isAuthenticated, (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid").sendStatus(200); // This forces the browser to forget you
      });
    });
  });

  // ============ STUDENT ROUTES ============

  // Create mood entry
  app.post("/api/mood-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });

      // Analyze mood with AI
      const analysis = await analyzeMoodEntry(
        validatedData.moodLevel,
        validatedData.stressLevel,
        validatedData.journalEntry || undefined
      );

      // Create the mood entry with AI insights
      const moodEntry = await storage.createMoodEntry({
        ...validatedData,
        aiSentiment: analysis.sentiment,
        aiInsights: analysis.insights,
      });

      // Create alert if needed
      if (analysis.alertType && analysis.alertReason) {
        await storage.createAlert({
          userId,
          alertType: analysis.alertType,
          reason: analysis.alertReason,
          isRead: false,
          isResolved: false,
        });
      }

      res.json(moodEntry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  // Get user's mood entries
  app.get("/api/mood-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entries = await storage.getMoodEntriesByUser(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  // Get daily wellness tip
  app.get("/api/wellness-tips/daily", async (req, res) => {
    try {
      const tip = await storage.getDailyTip();
      res.json(tip || null);
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      res.status(500).json({ message: "Failed to fetch daily tip" });
    }
  });

  // Get all resources
  app.get("/api/resources", isAuthenticated, async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get admin stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.json({ totalStudents: 0, activeToday: 0, totalAlerts: 0, urgentAlerts: 0, avgMood: 0, avgStress: 0 });
    }
  });

  // Get all alerts
  app.get("/api/admin/alerts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.json([]);
    }
  });

  // Mark alert as read
  app.patch("/api/admin/alerts/:id/read", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id, 10);
      const alert = await storage.markAlertRead(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  // Resolve alert
  app.patch("/api/admin/alerts/:id/resolve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id, 10);
      const alert = await storage.resolveAlert(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Get all students with stats
  app.get("/api/admin/students", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const students = await storage.getStudentsWithStats();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get recent entries for admin
  app.get("/api/admin/recent-entries", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const entries = await storage.getRecentMoodEntries(50);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching recent entries:", error);
      res.json([]);
    }
  });

  // Update user role (make admin)
  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      if (!["student", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // ============ SEED DATA ROUTES ============

  // Seed resources (can be called once to populate)
  app.post("/api/seed/resources", async (req, res) => {
    try {
      const defaultResources = [
        {
          title: "Managing Academic Stress",
          description: "Learn effective strategies to handle academic pressure",
          category: "stress",
          content: "Academic stress is common among students. Here are some strategies: 1) Break large tasks into smaller ones, 2) Create a realistic study schedule, 3) Take regular breaks using the Pomodoro technique, 4) Practice deep breathing before exams, 5) Seek help when you need it.",
          externalUrl: "https://www.apa.org/topics/stress/tips",
        },
        {
          title: "Better Sleep Habits",
          description: "Tips for improving your sleep quality",
          category: "sleep",
          content: "Good sleep is essential for mental health. Try these tips: 1) Maintain a consistent sleep schedule, 2) Avoid screens 1 hour before bed, 3) Keep your room cool and dark, 4) Limit caffeine after noon, 5) Practice relaxation techniques before bed.",
          externalUrl: "https://www.sleepfoundation.org/sleep-hygiene",
        },
        {
          title: "Building Healthy Study Habits",
          description: "Effective techniques for academic success",
          category: "academic",
          content: "Develop strong study habits: 1) Find your optimal study environment, 2) Use active recall and spaced repetition, 3) Take handwritten notes, 4) Teach concepts to others, 5) Review material regularly rather than cramming.",
          externalUrl: null,
        },
        {
          title: "Mindfulness and Meditation",
          description: "Introduction to mindfulness practices",
          category: "general",
          content: "Mindfulness can reduce anxiety and improve focus. Start with 5 minutes of daily meditation: 1) Find a quiet space, 2) Focus on your breath, 3) Notice thoughts without judgment, 4) Gently return focus to breathing, 5) Gradually increase duration.",
          externalUrl: "https://www.headspace.com/meditation-101/what-is-meditation",
        },
        {
          title: "Physical Exercise for Mental Health",
          description: "How exercise improves your mood",
          category: "general",
          content: "Regular physical activity boosts mental health: 1) Aim for 30 minutes of moderate exercise daily, 2) Choose activities you enjoy, 3) Exercise with friends for social benefits, 4) Start small and build gradually, 5) Notice how exercise affects your mood.",
          externalUrl: null,
        },
        {
          title: "Social Connection",
          description: "The importance of maintaining relationships",
          category: "general",
          content: "Social connections are vital for wellbeing: 1) Schedule regular time with friends, 2) Join clubs or groups that interest you, 3) Practice active listening, 4) Reach out when you're struggling, 5) Be there for others too.",
          externalUrl: null,
        },
      ];

      for (const resource of defaultResources) {
        await storage.createResource(resource);
      }

      res.json({ message: "Resources seeded successfully" });
    } catch (error) {
      console.error("Error seeding resources:", error);
      res.status(500).json({ message: "Failed to seed resources" });
    }
  });

  // Seed wellness tips
  app.post("/api/seed/tips", async (req, res) => {
    try {
      const defaultTips = [
        {
          title: "Take a Deep Breath",
          content: "When you feel overwhelmed, try the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7 seconds, and exhale for 8 seconds. This can help calm your nervous system.",
          category: "stress",
          iconName: "wind",
        },
        {
          title: "Move Your Body",
          content: "Even a short 10-minute walk can boost your mood and energy levels. Physical activity releases endorphins that naturally improve how you feel.",
          category: "exercise",
          iconName: "activity",
        },
        {
          title: "Practice Gratitude",
          content: "Take a moment to think of three things you're grateful for today. Focusing on positives can shift your perspective and improve your mood.",
          category: "mindfulness",
          iconName: "heart",
        },
        {
          title: "Stay Hydrated",
          content: "Dehydration can affect your mood and concentration. Keep a water bottle handy and aim for 8 glasses a day.",
          category: "health",
          iconName: "droplet",
        },
        {
          title: "Connect with Someone",
          content: "Reach out to a friend, family member, or classmate today. Social connection is one of the most powerful ways to boost your wellbeing.",
          category: "social",
          iconName: "users",
        },
        {
          title: "Take a Screen Break",
          content: "Give your eyes and mind a rest from screens. Look at something 20 feet away for 20 seconds every 20 minutes to reduce eye strain.",
          category: "health",
          iconName: "monitor-off",
        },
        {
          title: "Celebrate Small Wins",
          content: "Acknowledge your accomplishments, no matter how small. Finishing a task, making your bed, or eating a healthy meal all count!",
          category: "mindfulness",
          iconName: "trophy",
        },
      ];

      for (const tip of defaultTips) {
        await storage.createWellnessTip(tip);
      }

      res.json({ message: "Tips seeded successfully" });
    } catch (error) {
      console.error("Error seeding tips:", error);
      res.status(500).json({ message: "Failed to seed tips" });
    }
  });

  return httpServer;
}
