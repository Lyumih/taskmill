import Ajv from 'ajv'
import configSchemaSource from '../../../../schemas/taskmill-config.schema.json?raw'
import taskSchemaSource from '../../../../schemas/taskmill-task.schema.json?raw'
import { getPluginDefaultValues, mergePluginValues, pluginDefinitions } from '../plugins'
import type { ProcessDefinition } from '../types/process'
import type { Project, ProjectPluginConfig } from '../types/project'
import type { TaskData } from '../types/task'

export type TaskmillConfigFile = {
  $schema?: string
  schemaVersion: 1
  project: Pick<Project, 'id' | 'name'>
  processes: ProcessDefinition[]
  plugins?: ProjectPluginConfig[]
}

export type PersistedTaskData = TaskData & {
  id: string
  title: string
  type: string
  processId: string
}

export type TaskmillTaskFile = {
  $schema?: string
  schemaVersion: 1
  task: PersistedTaskData
}

const TASKMILL_SCHEMA_VERSION = 1
const ajv = new Ajv({ allErrors: true, strict: false })
const validateConfig = ajv.compile<TaskmillConfigFile>(JSON.parse(configSchemaSource))
const validateTask = ajv.compile<TaskmillTaskFile>(JSON.parse(taskSchemaSource))

type TaskSnapshot = {
  raw: string
  value: string
  schema?: string
}

function validationError(label: string, errors: typeof validateConfig.errors) {
  const details = ajv.errorsText(errors, { separator: '; ' })
  return new Error(`${label} не соответствует JSON Schema${details ? `: ${details}` : ''}`)
}

async function readText(handle: FileSystemFileHandle) {
  return (await handle.getFile()).text()
}

async function writeText(handle: FileSystemFileHandle, contents: string) {
  const writable = await handle.createWritable()
  try {
    await writable.write(contents)
    await writable.close()
  } catch (error) {
    try {
      await writable.abort()
    } catch {
      // Preserve the original write error.
    }
    throw error
  }
}

function json(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function ensureUnique(values: string[], label: string) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Повторяется ${label}: ${value}`)
    seen.add(value)
  }
}

function normalizePlugins(configuredPlugins: ProjectPluginConfig[] = []): ProjectPluginConfig[] {
  ensureUnique(configuredPlugins.map((plugin) => plugin.pluginId), 'pluginId в config.json')

  const knownPluginIds = new Set(pluginDefinitions.map((plugin) => plugin.id))
  const unknownPlugin = configuredPlugins.find((plugin) => !knownPluginIds.has(plugin.pluginId))
  if (unknownPlugin) throw new Error(`Неизвестный плагин в config.json: ${unknownPlugin.pluginId}`)

  return pluginDefinitions.map((plugin) => {
    const configured = configuredPlugins.find((item) => item.pluginId === plugin.id)
    return {
      pluginId: plugin.id,
      enabled: configured?.enabled ?? true,
      values: mergePluginValues(getPluginDefaultValues(plugin.id), configured?.values),
      comment: configured?.comment ?? '',
    }
  })
}

function validateProjectReferences(config: TaskmillConfigFile) {
  ensureUnique(config.processes.map((process) => process.id), 'process id в config.json')

  const knownPluginIds = new Set(pluginDefinitions.map((plugin) => plugin.id))
  for (const process of config.processes) {
    ensureUnique(process.blocks.map((block) => block.id), `block id в процессе ${process.id}`)
    for (const block of process.blocks) {
      if (!knownPluginIds.has(block.pluginId)) {
        throw new Error(`Процесс ${process.id} ссылается на неизвестный плагин ${block.pluginId}`)
      }
    }
  }
}

function configFromProject(project: Project, schema?: string): TaskmillConfigFile {
  return {
    ...(schema ? { $schema: schema } : {}),
    schemaVersion: TASKMILL_SCHEMA_VERSION,
    project: { id: project.id, name: project.name },
    processes: project.processes,
    plugins: project.plugins,
  }
}

function taskFileFromData(task: PersistedTaskData, schema?: string): TaskmillTaskFile {
  return { ...(schema ? { $schema: schema } : {}), schemaVersion: TASKMILL_SCHEMA_VERSION, task }
}

export class TaskmillDirectoryWorkspace {
  readonly project: Project
  readonly directory: FileSystemDirectoryHandle
  private configSnapshot: TaskSnapshot
  private readonly taskSnapshots: Map<string, TaskSnapshot>
  private saveQueue: Promise<void> = Promise.resolve()

  private constructor(
    directory: FileSystemDirectoryHandle,
    project: Project,
    configSnapshot: TaskSnapshot,
    taskSnapshots: Map<string, TaskSnapshot>,
  ) {
    this.directory = directory
    this.project = project
    this.configSnapshot = configSnapshot
    this.taskSnapshots = taskSnapshots
  }

  static async pick() {
    if (!window.isSecureContext) {
      throw new Error('Подключение папки требует HTTPS или localhost. Откройте локальную версию Taskmill либо защищённый сайт.')
    }

    const pickerWindow = window as Window & {
      showDirectoryPicker?: (options: { mode: 'readwrite' }) => Promise<FileSystemDirectoryHandle>
    }
    if (!pickerWindow.showDirectoryPicker) {
      throw new Error('Выбор папки доступен в актуальных Chrome и Edge. Откройте Taskmill в одном из этих браузеров.')
    }

    const directory = await pickerWindow.showDirectoryPicker({ mode: 'readwrite' })
    if (directory.name !== '.taskmill') {
      throw new Error('Выберите именно папку .taskmill внутри целевого проекта.')
    }

    return TaskmillDirectoryWorkspace.open(directory)
  }

  static async open(directory: FileSystemDirectoryHandle) {
    let configHandle: FileSystemFileHandle
    try {
      configHandle = await directory.getFileHandle('config.json')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        throw new Error('В выбранной папке нет config.json. Создайте его по примеру schemas/taskmill-config.example.json.')
      }
      throw error
    }
    const configText = await readText(configHandle)
    const configValue: unknown = JSON.parse(configText)
    if (!validateConfig(configValue)) throw validationError('config.json', validateConfig.errors)

    const config = configValue
    validateProjectReferences(config)
    const plugins = normalizePlugins(config.plugins)
    const tasks: PersistedTaskData[] = []
    const taskSnapshots = new Map<string, TaskSnapshot>()
    let taskDirectory: FileSystemDirectoryHandle | undefined

    try {
      taskDirectory = await directory.getDirectoryHandle('tasks')
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error
    }

    if (taskDirectory) {
      for await (const entry of taskDirectory.values()) {
        if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue

        const fileHandle = await taskDirectory.getFileHandle(entry.name)
        const raw = await readText(fileHandle)
        let value: unknown
        try {
          value = JSON.parse(raw)
        } catch {
          throw new Error(`${entry.name}: некорректный JSON`)
        }

        if (!validateTask(value)) throw validationError(entry.name, validateTask.errors)
        const task = value.task
        const taskIdFromFile = entry.name.slice(0, -'.json'.length)
        if (task.id !== taskIdFromFile) {
          throw new Error(`${entry.name}: task.id должен совпадать с именем файла (${taskIdFromFile})`)
        }
        if (!config.processes.some((process) => process.id === task.processId)) {
          throw new Error(`${entry.name}: неизвестный processId ${task.processId}`)
        }

        tasks.push(task)
        taskSnapshots.set(task.id, { raw, value: JSON.stringify(task), schema: value.$schema })
      }
    }

    ensureUnique(tasks.map((task) => task.id), 'task id в .taskmill/tasks')
    const project: Project = {
      id: config.project.id,
      name: config.project.name,
      tasks,
      processes: config.processes,
      plugins,
    }

    return new TaskmillDirectoryWorkspace(
      directory,
      project,
      { raw: configText, value: JSON.stringify(configFromProject(project, config.$schema)), schema: config.$schema },
      taskSnapshots,
    )
  }

  async refresh() {
    return TaskmillDirectoryWorkspace.open(this.directory)
  }

  save(project: Project) {
    const operation = this.saveQueue.then(() => this.saveChanges(project))
    this.saveQueue = operation.catch(() => undefined)
    return operation
  }

  private async saveChanges(project: Project) {
    const config = configFromProject(project, this.configSnapshot.schema)
    if (!validateConfig(config)) throw validationError('config.json', validateConfig.errors)
    validateProjectReferences(config)

    const currentConfigHandle = await this.directory.getFileHandle('config.json')
    const currentConfigText = await readText(currentConfigHandle)
    if (currentConfigText !== this.configSnapshot.raw) {
      throw new Error('config.json изменён вне Taskmill. Нажмите «Обновить» перед продолжением.')
    }

    const configValue = JSON.stringify(config)
    if (configValue !== this.configSnapshot.value) {
      const handle = await this.directory.getFileHandle('config.json')
      await this.writeIfUnchanged(handle, this.configSnapshot.raw, json(config))
      this.configSnapshot = { raw: json(config), value: configValue }
    }

    for (const task of project.tasks) {
      if (!task.id) throw new Error('У задачи отсутствует id; файл нельзя сохранить.')
      const snapshot = this.taskSnapshots.get(task.id)
      if (!snapshot) continue
      const taskValue = JSON.stringify(task)
      if (taskValue === snapshot.value) continue

      const directory = await this.directory.getDirectoryHandle('tasks')
      const handle = await directory.getFileHandle(`${task.id}.json`)
      const contents = json(taskFileFromData(task as PersistedTaskData, snapshot.schema))
      const taskFile: unknown = taskFileFromData(task as PersistedTaskData, snapshot.schema)
      if (!validateTask(taskFile)) throw validationError(`${task.id}.json`, validateTask.errors)
      await this.writeIfUnchanged(handle, snapshot.raw, contents)
      this.taskSnapshots.set(task.id, { raw: contents, value: taskValue, schema: snapshot.schema })
    }
  }

  private async writeIfUnchanged(handle: FileSystemFileHandle, originalText: string, nextText: string) {
    const currentText = await readText(handle)
    if (currentText !== originalText) {
      throw new Error(`${handle.name} изменён вне Taskmill. Нажмите «Обновить» перед продолжением.`)
    }
    await writeText(handle, nextText)
  }
}
