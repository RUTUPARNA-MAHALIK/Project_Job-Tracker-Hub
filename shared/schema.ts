import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  company: text("company").notNull(),
  position: text("position").notNull(),
  status: text("status").notNull(), // 'wishlist', 'applied', 'interview', 'offer', 'rejected'
  dateApplied: timestamp("date_applied"),
  url: text("url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  interviewType: text("interview_type").notNull(), // 'phone', 'technical', 'behavioral', 'onsite'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  interviews: many(interviews),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true, userId: true });
export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, userId: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true, userId: true });

// === EXPLICIT API CONTRACT TYPES ===

// Base Types
export type Application = typeof applications.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Resume = typeof resumes.$inferSelect;

// Request Types
export type CreateApplicationRequest = z.infer<typeof insertApplicationSchema>;
export type UpdateApplicationRequest = Partial<CreateApplicationRequest>;

export type CreateInterviewRequest = z.infer<typeof insertInterviewSchema>;
export type UpdateInterviewRequest = Partial<CreateInterviewRequest>;

export type CreateContactRequest = z.infer<typeof insertContactSchema>;
export type UpdateContactRequest = Partial<CreateContactRequest>;

export type CreateResumeRequest = z.infer<typeof insertResumeSchema>;
export type UpdateResumeRequest = Partial<CreateResumeRequest>;

// Analytics response
export interface AnalyticsResponse {
  totalApplications: number;
  wishlistCount: number;
  appliedCount: number;
  interviewingCount: number;
  offersCount: number;
  rejectionsCount: number;
  upcomingInterviews: Interview[];
}
