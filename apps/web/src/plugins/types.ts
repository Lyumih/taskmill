export type PluginError = {
  id: string
  type: string
  customType: string
  description: string
}

export type PluginRecord = {
  id?: string
  [fieldId: string]: PluginFieldValue | undefined
}

export type PluginFieldValue = string | number | boolean | null | string[] | PluginError[] | PluginRecord | PluginRecord[]

export type PluginField = {
  id: string
  label: string
  visibleWhen?: { fieldId: string; equals: string | number | boolean }
} & (
  | { type: 'text' | 'url' | 'textarea'; value: string }
  | { type: 'url-list' | 'string-list'; value: string[]; placeholder?: string }
  | { type: 'date'; value: string | null }
  | { type: 'rating'; value: number | null; max: 5 | 10 }
  | { type: 'number'; value: number | null; min?: number; max?: number; unit?: string }
  | { type: 'choice'; value: string | null; options: Array<{ value: string; label: string }> }
  | { type: 'boolean'; value: boolean }
  | { type: 'errors'; value: PluginError[]; options: Array<{ value: string; label: string }> }
  | { type: 'object'; value: PluginRecord; fields: PluginField[] }
  | { type: 'object-list'; value: PluginRecord[]; fields: PluginField[]; addLabel?: string }
)

export type PluginValues = Record<string, PluginFieldValue>

export type PluginDefinition = {
  id: string
  title: string
  description: string
  projectView?: boolean
  fields: PluginField[]
  taskSource?: string
  taskFieldSources?: Record<string, string>
  validate?: (values: PluginValues) => string[]
}
