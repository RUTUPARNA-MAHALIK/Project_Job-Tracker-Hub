import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  applications,
  interviews,
  contacts,
  resumes,
  type Application,
  type Interview,
  type Contact,
  type Resume,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
  type CreateInterviewRequest,
  type UpdateInterviewRequest,
  type CreateContactRequest,
  type UpdateContactRequest,
  type CreateResumeRequest,
  type UpdateResumeRequest,
  type AnalyticsResponse
} from "@shared/schema";

export interface IStorage {
  // Applications
  getApplications(userId: string): Promise<Application[]>;
  getApplication(id: number, userId: string): Promise<Application | undefined>;
  createApplication(userId: string, app: CreateApplicationRequest): Promise<Application>;
  updateApplication(id: number, userId: string, updates: UpdateApplicationRequest): Promise<Application | undefined>;
  deleteApplication(id: number, userId: string): Promise<boolean>;

  // Interviews
  getInterviews(userId: string): Promise<Interview[]>;
  getInterviewsForApplication(applicationId: number, userId: string): Promise<Interview[]>;
  getInterview(id: number, userId: string): Promise<Interview | undefined>;
  createInterview(userId: string, interview: CreateInterviewRequest): Promise<Interview | undefined>;
  updateInterview(id: number, userId: string, updates: UpdateInterviewRequest): Promise<Interview | undefined>;
  deleteInterview(id: number, userId: string): Promise<boolean>;

  // Contacts
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: number, userId: string): Promise<Contact | undefined>;
  createContact(userId: string, contact: CreateContactRequest): Promise<Contact>;
  updateContact(id: number, userId: string, updates: UpdateContactRequest): Promise<Contact | undefined>;
  deleteContact(id: number, userId: string): Promise<boolean>;

  // Resumes
  getResumes(userId: string): Promise<Resume[]>;
  getResume(id: number, userId: string): Promise<Resume | undefined>;
  createResume(userId: string, resume: CreateResumeRequest): Promise<Resume>;
  updateResume(id: number, userId: string, updates: UpdateResumeRequest): Promise<Resume | undefined>;
  deleteResume(id: number, userId: string): Promise<boolean>;

  // Analytics
  getAnalytics(userId: string): Promise<AnalyticsResponse>;
}

export class DatabaseStorage implements IStorage {
  // Applications
  async getApplications(userId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async getApplication(id: number, userId: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(and(eq(applications.id, id), eq(applications.userId, userId)));
    return app;
  }

  async createApplication(userId: string, app: CreateApplicationRequest): Promise<Application> {
    const [newApp] = await db.insert(applications).values({ ...app, userId }).returning();
    return newApp;
  }

  async updateApplication(id: number, userId: string, updates: UpdateApplicationRequest): Promise<Application | undefined> {
    const [updated] = await db.update(applications)
      .set(updates)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return updated;
  }

  async deleteApplication(id: number, userId: string): Promise<boolean> {
    const [deleted] = await db.delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return !!deleted;
  }

  // Interviews
  async getInterviews(userId: string): Promise<Interview[]> {
    // We need to join with applications to ensure the interview belongs to the user
    const result = await db.select({
      interview: interviews
    })
    .from(interviews)
    .innerJoin(applications, eq(interviews.applicationId, applications.id))
    .where(eq(applications.userId, userId));
    
    return result.map(r => r.interview);
  }

  async getInterviewsForApplication(applicationId: number, userId: string): Promise<Interview[]> {
    // First verify the application belongs to the user
    const app = await this.getApplication(applicationId, userId);
    if (!app) return [];
    
    return await db.select().from(interviews).where(eq(interviews.applicationId, applicationId));
  }

  async getInterview(id: number, userId: string): Promise<Interview | undefined> {
    const result = await db.select({
      interview: interviews
    })
    .from(interviews)
    .innerJoin(applications, eq(interviews.applicationId, applications.id))
    .where(and(eq(interviews.id, id), eq(applications.userId, userId)));
    
    if (result.length === 0) return undefined;
    return result[0].interview;
  }

  async createInterview(userId: string, interview: CreateInterviewRequest): Promise<Interview | undefined> {
    // Verify application belongs to user
    const app = await this.getApplication(interview.applicationId, userId);
    if (!app) return undefined;

    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: number, userId: string, updates: UpdateInterviewRequest): Promise<Interview | undefined> {
    // Verify interview belongs to user via application
    const existing = await this.getInterview(id, userId);
    if (!existing) return undefined;

    const [updated] = await db.update(interviews)
      .set(updates)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  async deleteInterview(id: number, userId: string): Promise<boolean> {
    // Verify interview belongs to user
    const existing = await this.getInterview(id, userId);
    if (!existing) return false;

    const [deleted] = await db.delete(interviews)
      .where(eq(interviews.id, id))
      .returning();
    return !!deleted;
  }

  // Contacts
  async getContacts(userId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.userId, userId));
  }

  async getContact(id: number, userId: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
    return contact;
  }

  async createContact(userId: string, contact: CreateContactRequest): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values({ ...contact, userId }).returning();
    return newContact;
  }

  async updateContact(id: number, userId: string, updates: UpdateContactRequest): Promise<Contact | undefined> {
    const [updated] = await db.update(contacts)
      .set(updates)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .returning();
    return updated;
  }

  async deleteContact(id: number, userId: string): Promise<boolean> {
    const [deleted] = await db.delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
      .returning();
    return !!deleted;
  }

  // Resumes
  async getResumes(userId: string): Promise<Resume[]> {
    return await db.select().from(resumes).where(eq(resumes.userId, userId));
  }

  async getResume(id: number, userId: string): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
    return resume;
  }

  async createResume(userId: string, resume: CreateResumeRequest): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values({ ...resume, userId }).returning();
    return newResume;
  }

  async updateResume(id: number, userId: string, updates: UpdateResumeRequest): Promise<Resume | undefined> {
    const [updated] = await db.update(resumes)
      .set(updates)
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
      .returning();
    return updated;
  }

  async deleteResume(id: number, userId: string): Promise<boolean> {
    const [deleted] = await db.delete(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
      .returning();
    return !!deleted;
  }

  // Analytics
  async getAnalytics(userId: string): Promise<AnalyticsResponse> {
    const allApps = await this.getApplications(userId);
    
    // Get upcoming interviews
    const allInterviews = await this.getInterviews(userId);
    const now = new Date();
    const upcomingInterviews = allInterviews
      .filter(i => new Date(i.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // top 5 upcoming
      
    return {
      totalApplications: allApps.length,
      wishlistCount: allApps.filter(a => a.status === 'wishlist').length,
      appliedCount: allApps.filter(a => a.status === 'applied').length,
      interviewingCount: allApps.filter(a => a.status === 'interview').length,
      offersCount: allApps.filter(a => a.status === 'offer').length,
      rejectionsCount: allApps.filter(a => a.status === 'rejected').length,
      upcomingInterviews
    };
  }
}

export const storage = new DatabaseStorage();
