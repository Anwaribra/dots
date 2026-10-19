import { TaskCaptureSchema, type TaskCaptureInput, type WorkItemCandidate } from '../types'

export function captureTask(input: TaskCaptureInput): WorkItemCandidate {
  const parsed = TaskCaptureSchema.parse(input)
  const id = parsed.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

  return {
    id,
    title: parsed.title,
    estimatedMinutes: parsed.estimatedMinutes,
    actualMinutes: 0,
    priority: parsed.priority,
    status: 'todo',
    energyLevel: parsed.energyLevel || null,
    deadline: parsed.deadline || null,
    preferredDate: parsed.preferredDate || null,
    preferredStartTime: parsed.preferredStartTime || null,
    flexibility: parsed.flexibility,
    projectId: parsed.projectId || null,
    goalId: parsed.goalId || null,
    areaId: parsed.areaId || null,
    orderIndex: 0
  }
}
