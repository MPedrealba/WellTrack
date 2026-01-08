import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express, RequestHandler, Request, Response } from "express";
import { storage } from "./storage";

// Extend Express Request to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
    };
    login: (user: any, done: (err: any) => void) => void;
    logout: (done: (err: any) => void) => void;
  }
}

// Extend session to include user
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
    };
  }
}

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // Must be FALSE for localhost
      sameSite: "lax", // Helps with local redirects
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  });
}

export async function setupAuth(app: Express) {
  // Passport session serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        });
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  // Only set up Google OAuth if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here') {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists by Google ID
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              // Check if user exists by email
              user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");

              if (user) {
                // Update existing user with Google ID
                user = await storage.updateUserGoogleId(user.id, profile.id);
              } else {
                // Create new user
                const role = profile.emails?.[0]?.value?.endsWith("@admin.welltrack.edu") ? "admin" : "student";
                user = await storage.createUser({
                  email: profile.emails?.[0]?.value || "",
                  firstName: profile.name?.givenName,
                  lastName: profile.name?.familyName,
                  role,
                  googleId: profile.id,
                });
              }
            }

            return done(null, {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            });
          } catch (error) {
            return done(error);
          }
        }
      )
    );

    // Google OAuth routes
    app.get(
      "/api/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
      })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: '/login' }),
      (req: Request, res: Response) => {
        // Successful authentication, session is handled by passport
        // Redirect based on user role
        if (req.user?.role === 'admin') {
          res.redirect('/admin');
        } else {
          res.redirect('/');
        }
      }
    );
  }

    // Development login endpoint (only in development)
    if (process.env.NODE_ENV !== "production") {
      app.post("/api/login", async (req: Request, res: Response, next) => {
        try {
          const { email, password } = req.body;
  
          if (!email) {
            return res.status(400).json({ message: "Email is required" });
          }
  
          // Find user by email or create demo user
          let user = await storage.getUserByEmail(email);
          if (!user) {
            // Create demo user
            const role = email.endsWith("@admin.welltrack.edu") ? "admin" : "student";
            user = await storage.createUser({
              email,
              firstName: email.split("@")[0],
              lastName: "Demo",
              role,
            });
          }
  
          // Log in the user
          req.logIn(user, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.status(500).json({ message: "Internal server error" });
            }
  
            res.json({
              id: user.id,
              email: user.email,
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              role: user.role,
            });
          });
        } catch (error) {
          console.error("Login error:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      });
    }
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        });
      } else {
        done(null, null);
      }
    } catch (error) {
      done(error);
    }
  });

  app.get("/api/auth/google/status", (req: Request, res: Response) => {
    const available = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here');
    res.json({ available });
  });

  // Logout route
  app.post("/api/logout", isAuthenticated, (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Check auth status
  app.get("/api/auth/status", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json({
        authenticated: true,
        user: req.user,
      });
    } else {
      res.json({ authenticated: false });
    }
  });
}

export const isAuthenticated: RequestHandler = (req: Request, res: Response, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Admin check middleware
export const isAdmin: RequestHandler = async (req: Request, res: Response, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user;
  if (!user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const dbUser = await storage.getUser(user.id);
  if (!dbUser || dbUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};
