import { z } from 'zod';
import { 
  insertApplicationSchema, 
  insertInterviewSchema, 
  insertContactSchema, 
  insertResumeSchema,
  applications,
  interviews,
  contacts,
  resumes
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Types for responses
const applicationSchema = z.custom<typeof applications.$inferSelect>();
const interviewSchema = z.custom<typeof interviews.$inferSelect>();
const contactSchema = z.custom<typeof contacts.$inferSelect>();
const resumeSchema = z.custom<typeof resumes.$inferSelect>();

const analyticsSchema = z.object({
  totalApplications: z.number(),
  wishlistCount: z.number(),
  appliedCount: z.number(),
  interviewingCount: z.number(),
  offersCount: z.number(),
  rejectionsCount: z.number(),
  upcomingInterviews: z.array(interviewSchema),
});

export const api = {
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications' as const,
      responses: {
        200: z.array(applicationSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id' as const,
      responses: {
        200: applicationSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications' as const,
      input: insertApplicationSchema,
      responses: {
        201: applicationSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/applications/:id' as const,
      input: insertApplicationSchema.partial(),
      responses: {
        200: applicationSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/applications/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  interviews: {
    list: {
      method: 'GET' as const,
      path: '/api/interviews' as const,
      responses: {
        200: z.array(interviewSchema),
      },
    },
    listByApplication: {
      method: 'GET' as const,
      path: '/api/applications/:applicationId/interviews' as const,
      responses: {
        200: z.array(interviewSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/interviews' as const,
      input: insertInterviewSchema,
      responses: {
        201: interviewSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/interviews/:id' as const,
      input: insertInterviewSchema.partial(),
      responses: {
        200: interviewSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/interviews/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  contacts: {
    list: {
      method: 'GET' as const,
      path: '/api/contacts' as const,
      responses: {
        200: z.array(contactSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contacts' as const,
      input: insertContactSchema,
      responses: {
        201: contactSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/contacts/:id' as const,
      input: insertContactSchema.partial(),
      responses: {
        200: contactSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/contacts/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  resumes: {
    list: {
      method: 'GET' as const,
      path: '/api/resumes' as const,
      responses: {
        200: z.array(resumeSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/resumes' as const,
      input: insertResumeSchema,
      responses: {
        201: resumeSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/resumes/:id' as const,
      input: insertResumeSchema.partial(),
      responses: {
        200: resumeSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/resumes/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: {
        200: analyticsSchema,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ApplicationInput = z.infer<typeof api.applications.create.input>;
export type InterviewInput = z.infer<typeof api.interviews.create.input>;
export type ContactInput = z.infer<typeof api.contacts.create.input>;
export type ResumeInput = z.infer<typeof api.resumes.create.input>;
