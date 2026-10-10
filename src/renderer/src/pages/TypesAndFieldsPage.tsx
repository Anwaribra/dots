import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import type { CustomFieldDefinition, WorkItemType } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { Dialog } from '../components/ui/dialog'

export function TypesAndFieldsPage(): JSX.Element {
  const { t } = useTranslation()
  const [types, setTypes] = useState<WorkItemType[]>([])
  const [selectedType, setSelectedType] = useState<WorkItemType | null>(null)
  const [customDefs, setCustomDefs] = useState<CustomFieldDefinition[]>([])

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [typeName, setTypeName] = useState('')
  const [typeColor, setTypeColor] = useState('#3b82f6')

  const [isDefModalOpen, setIsDefModalOpen] = useState(false)
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'boolean' | 'date' | 'select'>('text')
  const [fieldOptions, setFieldOptions] = useState('')

  const planner = window.planner

  const refreshTypes = async (): Promise<void> => {
    if (!planner) return
    const list = await planner.workItemTypes.list()
    setTypes(list)
    if (list.length > 0 && !selectedType) {
      setSelectedType(list[0])
    }
  }

  const refreshDefs = async (typeId: string): Promise<void> => {
    if (!planner) return
    const list = await planner.customFieldDefs.list(typeId)
    setCustomDefs(list)
  }

  useEffect(() => {
    void refreshTypes()
  }, [])

  useEffect(() => {
    if (selectedType) void refreshDefs(selectedType.id)
  }, [selectedType])

  const handleCreateType = async (): Promise<void> => {
    if (!typeName.trim() || !planner) return
    const created = await planner.workItemTypes.create({
      name: typeName.trim(),
      color: typeColor,
      builtIn: false
    })
    setIsTypeModalOpen(false)
    setTypeName('')
    await refreshTypes()
    setSelectedType(created)
  }

  const handleCreateDef = async (): Promise<void> => {
    if (!fieldName.trim() || !selectedType || !planner) return
    const optionsArr = fieldType === 'select' ? fieldOptions.split(',').map((s) => s.trim()).filter(Boolean) : undefined
    await planner.customFieldDefs.create({
      workItemTypeId: selectedType.id,
      name: fieldName.trim(),
      fieldType,
      options: optionsArr
    })
    setIsDefModalOpen(false)
    setFieldName('')
    setFieldOptions('')
    await refreshDefs(selectedType.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('workItemTypes')} & {t('customFields')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define custom activity types and attach domain-specific fields without source-code changes.
          </p>
        </div>
        <Button onClick={() => setIsTypeModalOpen(true)}>
          <Plus size={18} className="me-1" />
          {t('create')} Type
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Types</h3>
          <div className="space-y-1">
            {types.map((type) => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-3 text-sm transition-colors ${
                  selectedType?.id === type.id
                    ? 'bg-indigo-50 font-semibold text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200'
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color || '#3b82f6' }} />
                  <span>{type.name}</span>
                </div>
                {type.builtIn && <span className="text-xs text-slate-400">Built-in</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedType ? (
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedType.name}</h3>
                  <p className="text-xs text-slate-500">Custom field definitions for this work item type</p>
                </div>
                <Button size="sm" onClick={() => setIsDefModalOpen(true)}>
                  <Plus size={16} className="me-1" />
                  Add Custom Field
                </Button>
              </div>

              <div className="space-y-2">
                {customDefs.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No custom fields defined for this type yet.</p>
                ) : (
                  customDefs.map((def) => (
                    <div
                      key={def.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{def.name}</span>
                        <span className="ms-2 text-xs font-mono text-indigo-600 dark:text-indigo-400">({def.fieldType})</span>
                      </div>
                      {def.options && (
                        <span className="text-xs text-slate-500">Options: {def.options.join(', ')}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400">Select a work item type to manage custom fields.</Card>
          )}
        </div>
      </div>

      {/* New Type Dialog */}
      <Dialog isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="Create Work Item Type">
        <div className="space-y-4">
          <Input
            label="Type Name"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="e.g. Workout, Client Deliverable, Course Lesson"
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
            <input
              type="color"
              value={typeColor}
              onChange={(e) => setTypeColor(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={() => setIsTypeModalOpen(false)}>{t('cancel')}</Button>
            <Button onClick={() => void handleCreateType()}>{t('save')}</Button>
          </div>
        </div>
      </Dialog>

      {/* New Field Definition Dialog */}
      <Dialog isOpen={isDefModalOpen} onClose={() => setIsDefModalOpen(false)} title={`Add Custom Field to ${selectedType?.name}`}>
        <div className="space-y-4">
          <Input
            label="Field Name"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="e.g. Sets, Reps, Weight, Client, Revenue"
          />
          <Select
            label="Field Type"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value as any)}
            options={[
              { value: 'text', label: 'Text' },
              { value: 'number', label: 'Number' },
              { value: 'boolean', label: 'Boolean (Yes/No)' },
              { value: 'date', label: 'Date' },
              { value: 'select', label: 'Select Dropdown' }
            ]}
          />
          {fieldType === 'select' && (
            <Input
              label="Options (comma separated)"
              value={fieldOptions}
              onChange={(e) => setFieldOptions(e.target.value)}
              placeholder="e.g. High, Medium, Low"
            />
          )}
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={() => setIsDefModalOpen(false)}>{t('cancel')}</Button>
            <Button onClick={() => void handleCreateDef()}>{t('save')}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
