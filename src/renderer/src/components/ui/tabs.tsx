import React, { useState } from 'react'

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  defaultTabId?: string
}

export function Tabs({ tabs, defaultTabId }: TabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState(defaultTabId || (tabs[0]?.id ?? ''))

  return (
    <div className="w-full space-y-4">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`me-4 pb-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs.find((t) => t.id === activeTab)?.content}</div>
    </div>
  )
}
