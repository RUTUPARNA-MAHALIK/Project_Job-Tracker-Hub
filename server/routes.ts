import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register authentication routes
  registerAuthRoutes(app);

  // Require authentication for all API routes (except auth itself which is handled above)
  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/login") || req.path.startsWith("/callback") || req.path.startsWith("/auth/")) {
      return next();
    }
    // We need to bypass for development / testing if the middleware isn't present
    // But since we have Replit Auth, we should enforce it
    isAuthenticated(req, res, next);
  });

  // --- Applications ---

  app.get(api.applications.list.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const apps = await storage.getApplications(userId);
    res.json(apps);
  });

  app.get(api.applications.get.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const app = await storage.getApplication(Number(req.params.id), userId);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(app);
  });

  app.post(api.applications.create.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.applications.create.input.parse(req.body);
      const app = await storage.createApplication(userId, input);
      res.status(201).json(app);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.applications.update.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.applications.update.input.parse(req.body);
      const app = await storage.updateApplication(Number(req.params.id), userId, input);
      if (!app) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(app);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.applications.delete.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const deleted = await storage.deleteApplication(Number(req.params.id), userId);
    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(204).send();
  });

  // --- Interviews ---

  app.get(api.interviews.list.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const interviews = await storage.getInterviews(userId);
    res.json(interviews);
  });

  app.get(api.interviews.listByApplication.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const interviews = await storage.getInterviewsForApplication(Number(req.params.applicationId), userId);
    res.json(interviews);
  });

  app.post(api.interviews.create.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.interviews.create.input.parse(req.body);
      const interview = await storage.createInterview(userId, input);
      if (!interview) {
        return res.status(400).json({ message: "Application not found or unauthorized", field: "applicationId" });
      }
      res.status(201).json(interview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.interviews.update.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.interviews.update.input.parse(req.body);
      const interview = await storage.updateInterview(Number(req.params.id), userId, input);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      res.json(interview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.interviews.delete.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const deleted = await storage.deleteInterview(Number(req.params.id), userId);
    if (!deleted) {
      return res.status(404).json({ message: "Interview not found" });
    }
    res.status(204).send();
  });

  // --- Contacts ---

  app.get(api.contacts.list.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const contacts = await storage.getContacts(userId);
    res.json(contacts);
  });

  app.post(api.contacts.create.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.contacts.create.input.parse(req.body);
      const contact = await storage.createContact(userId, input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.contacts.update.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.contacts.update.input.parse(req.body);
      const contact = await storage.updateContact(Number(req.params.id), userId, input);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.contacts.delete.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const deleted = await storage.deleteContact(Number(req.params.id), userId);
    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(204).send();
  });

  // --- Resumes ---

  app.get(api.resumes.list.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const resumes = await storage.getResumes(userId);
    res.json(resumes);
  });

  app.post(api.resumes.create.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.resumes.create.input.parse(req.body);
      const resume = await storage.createResume(userId, input);
      res.status(201).json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.resumes.update.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.resumes.update.input.parse(req.body);
      const resume = await storage.updateResume(Number(req.params.id), userId, input);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.resumes.delete.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const deleted = await storage.deleteResume(Number(req.params.id), userId);
    if (!deleted) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(204).send();
  });

  // --- Analytics ---

  app.get(api.analytics.get.path, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const analytics = await storage.getAnalytics(userId);
    res.json(analytics);
  });

  return httpServer;
}
