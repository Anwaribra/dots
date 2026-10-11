import React from 'react'
import { useTranslation } from 'react-i18next'
import { X, Keyboard } from 'lucide-react'

interface ShortcutEntry {
  keys: string[]
  descriptionKey: string
  categoryKey: string
}

const SHORTCUTS: ShortcutEntry[] = [
  // Navigation
  { categoryKey: 'navigation', keys: ['Ctrl', 'F'], descriptionKey: 'openGlobalSearch' },
  { categoryKey: 'navigation', keys: ['Ctrl', 'K'], descriptionKey: 'quickAddItem' },
  { categoryKey: 'navigation', keys: ['Alt', 'N'], descriptionKey: 'quickAddItemAlt' },
  { categoryKey: 'navigation', keys: ['Ctrl', '/'], descriptionKey: 'showKeyboardShortcuts' },
  { categoryKey: 'navigation', keys: ['Esc'], descriptionKey: 'closeModal' },
  // Search
  { categoryKey: 'search', keys: ['↑', '↓'], descriptionKey: 'navigateSearchResults' },
  { categoryKey: 'search', keys: ['↵'], descriptionKey: 'openSelectedResult' },
  // Quick Add
  { categoryKey: 'quickAdd', keys: ['↵'], descriptionKey: 'saveNewItem' },
  { categoryKey: 'quickAdd', keys: ['Esc'], descriptionKey: 'cancel' }
]

const CATEGORY_KEYS = [...new Set(SHORTCUTS.map((s) => s.categoryKey))]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsHelpModal({ isOpen, onClose }: Props): JSX.Element | null {
  const { t } = useTranslation()
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
    >
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Keyboard size={18} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('keyboardShortcuts')}</h2>
          </div>
          <button
            onClick={onClose}
            id="shortcuts-close-btn"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {CATEGORY_KEYS.map((catKey) => (
            <div key={catKey}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t(catKey)}</h3>
              <div className="space-y-2">
                {SHORTCUTS.filter((s) => s.categoryKey === catKey).map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{t(s.descriptionKey)}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-200 shadow-sm">
                            {k}
                          </kbd>
                          {ki < s.keys.length - 1 && (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          {t('pressEscToClose')}
        </div>
      </div>
    </div>
  )
}
