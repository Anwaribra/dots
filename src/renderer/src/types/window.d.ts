declare global {
  interface Window {
    planner: {
      settings: { get: () => Promise<import('../../../shared/settings').Settings>; update: (input: Partial<import('../../../shared/settings').Settings>) => Promise<import('../../../shared/settings').Settings> }
      areas: { list: () => Promise<Array<{ id: string; name: string }>>; create: (input: { name: string }) => Promise<unknown> }
      goals: { list: () => Promise<Array<{ id: string; title: string }>>; create: (input: { title: string }) => Promise<unknown> }
      projects: { list: () => Promise<Array<{ id: string; title: string }>>; create: (input: { title: string }) => Promise<unknown> }
      workItems: { list: () => Promise<Array<{ id: string; title: string; estimatedMinutes: number }>>; create: (input: { title: string; estimatedMinutes?: number }) => Promise<unknown> }
      entities: { archive: (input: { kind: string; id: string }) => Promise<void> }
    }
  }
}

export {}
