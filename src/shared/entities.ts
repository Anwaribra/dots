import { z } from 'zod'

export const prioritySchema = z.enum(['critical', 'high', 'medium', 'low'])
export const entityKindSchema = z.enum(['area', 'goal', 'project', 'workItem'])
export const createAreaSchema = z.object({ name: z.string().trim().min(1).max(120), description: z.string().max(4000).optional(), color: z.string().max(32).optional() })
export const createGoalSchema = z.object({ title: z.string().trim().min(1).max(200), areaId: z.string().uuid().nullable().optional(), priority: prioritySchema.default('medium'), targetDate: z.string().date().nullable().optional() })
export const createProjectSchema = z.object({ title: z.string().trim().min(1).max(200), goalId: z.string().uuid().nullable().optional(), areaId: z.string().uuid().nullable().optional(), priority: prioritySchema.default('medium'), deadline: z.string().date().nullable().optional() })
export const createWorkItemSchema = z.object({ title: z.string().trim().min(1).max(200), projectId: z.string().uuid().nullable().optional(), estimatedMinutes: z.number().int().min(0).max(100000).default(0), priority: prioritySchema.default('medium') })
export const archiveEntitySchema = z.object({ kind: entityKindSchema, id: z.string().uuid() })
export type Area = z.infer<typeof createAreaSchema> & { id: string; createdAt: number; archivedAt: number | null }
export type Goal = z.infer<typeof createGoalSchema> & { id: string; createdAt: number; archivedAt: number | null }
export type Project = z.infer<typeof createProjectSchema> & { id: string; createdAt: number; archivedAt: number | null }
export type WorkItem = z.infer<typeof createWorkItemSchema> & { id: string; createdAt: number; archivedAt: number | null }
