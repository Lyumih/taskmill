export type PluginError = {
  id: string
  type: string
  customType: string
  description: string
}

export type PluginField = {
  id: string
  label: string
} & (
  | { type: 'text' | 'textarea'; value: string }
  | { type: 'url-list' | 'string-list'; value: string[]; placeholder?: string }
  | { type: 'date'; value: string | null }
  | { type: 'rating'; value: number | null; max: 5 | 10 }
  | { type: 'number'; value: number | null; min?: number; max?: number; unit?: string }
  | { type: 'choice'; value: string | null; options: Array<{ value: string; label: string }> }
  | { type: 'boolean'; value: boolean }
  | { type: 'errors'; value: PluginError[]; options: Array<{ value: string; label: string }> }
)

export type PluginFieldValue = PluginField['value']
export type PluginValues = Record<string, PluginFieldValue>

export type PluginDefinition = {
  id: string
  title: string
  description: string
  fields: PluginField[]
  validate?: (values: PluginValues) => string[]
}
