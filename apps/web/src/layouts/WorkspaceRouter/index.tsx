import { Empty } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useRoutes } from 'react-router'
import { mockProjects } from '../../../mock'
import type { ProcessDefinition } from '../../types/process'
import type { Project, ProjectPluginConfig } from '../../types/project'
import type { TaskData } from '../../types/task'
import {
  clearTaskmillDirectoryHandle,
  loadTaskmillDirectoryHandle,
  saveTaskmillDirectoryHandle,
  type PermissionedTaskmillDirectoryHandle,
} from '../../utils/taskmillDirectoryHandle'
import { TaskmillDirectoryWorkspace } from '../../utils/taskmillWorkspace'
import { AppLayout } from '../AppLayout'
import type { AppPage } from '../AppLayout'
import { BlocksPage } from '../../pages/BlocksPage'
import { OverviewPage } from '../../pages/OverviewPage'
import { ProcessesPage } from '../../pages/ProcessesPage'
import { SettingsPage } from '../../pages/SettingsPage'

const defaultProject = mockProjects[0]
const defaultTaskId = defaultProject?.tasks[0]?.id ?? ''
const reservedPaths = new Set(['settings', 'blocks', 'processes', 'tasks'])

type TaskRoute = {
  projectId: string
  taskSegment: string
}

function taskPath(projectId: string, taskId: string) {
  const taskSegment = taskId.startsWith('task') ? taskId : `task${taskId}`
  return `/${encodeURIComponent(projectId)}/${encodeURIComponent(taskSegment)}`
}

function parseTaskRoute(pathname: string): TaskRoute | undefined {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 2 || reservedPaths.has(segments[0])) return undefined

  return {
    projectId: decodeURIComponent(segments[0]),
    taskSegment: decodeURIComponent(segments[1]),
  }
}

function findTaskId(projects: Project[], projectId: string, taskSegment: string) {
  const project = projects.find((item) => item.id === projectId)
  const exactTask = project?.tasks.find((task) => task.id === taskSegment)
  if (exactTask?.id) return exactTask.id

  const taskId = taskSegment.startsWith('task') ? taskSegment.slice('task'.length) : taskSegment
  return project?.tasks.find((task) => task.id === taskId)?.id
}

export function WorkspaceRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const projectsRef = useRef<Project[]>(mockProjects)
  const workspaceRef = useRef<TaskmillDirectoryWorkspace | null>(null)
  const connectedProjectIdRef = useRef<string | null>(null)
  const pendingSaveRef = useRef<Project | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const savedDirectoryHandleRef = useRef<PermissionedTaskmillDirectoryHandle | null>(null)
  const [connected, setConnected] = useState(false)
  const [resumeAvailable, setResumeAvailable] = useState(false)
  const [connectedProjectId, setConnectedProjectId] = useState<string | null>(null)
  const [connectionLoading, setConnectionLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle')
  const [workspaceError, setWorkspaceError] = useState<string>()
  const [fallbackSelection, setFallbackSelection] = useState({
    projectId: defaultProject?.id ?? '',
    taskId: defaultTaskId,
  })

  const replaceProjects = (nextProjects: Project[]) => {
    projectsRef.current = nextProjects
    setProjects(nextProjects)
  }

  const flushPendingSave = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    const project = pendingSaveRef.current
    const workspace = workspaceRef.current
    if (!project || !workspace) return true
    pendingSaveRef.current = null
    setSaveStatus('saving')

    const operation = saveQueueRef.current.then(() => workspace.save(project))
    saveQueueRef.current = operation.catch(() => undefined)
    try {
      await operation
      setSaveStatus(pendingSaveRef.current ? 'pending' : 'saved')
      setWorkspaceError(undefined)
      return true
    } catch (error) {
      pendingSaveRef.current ??= project
      setSaveStatus('error')
      setWorkspaceError(error instanceof Error ? error.message : 'Не удалось сохранить файлы Taskmill.')
      return false
    }
  }

  const scheduleSave = (project: Project) => {
    pendingSaveRef.current = project
    setSaveStatus('pending')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => void flushPendingSave(), 500)
  }

  const replaceConnectedProject = (project: Project) => {
    const previousId = connectedProjectIdRef.current
    connectedProjectIdRef.current = project.id
    setConnectedProjectId(project.id)
    replaceProjects([
      ...projectsRef.current.filter((item) => item.id !== previousId && item.id !== project.id),
      project,
    ])
    const taskId = project.tasks[0]?.id ?? ''
    setFallbackSelection({ projectId: project.id, taskId })
    navigate(taskId ? taskPath(project.id, taskId) : '/processes')
  }

  const connectWorkspace = async () => {
    const pickPromise = TaskmillDirectoryWorkspace.pick()
    setConnectionLoading(true)
    setWorkspaceError(undefined)
    try {
      const workspace = await pickPromise
      if (workspaceRef.current && !(await flushPendingSave())) return
      await saveQueueRef.current
      savedDirectoryHandleRef.current = workspace.directory as PermissionedTaskmillDirectoryHandle
      setResumeAvailable(false)
      try {
        await saveTaskmillDirectoryHandle(workspace.directory)
      } catch {
        try {
          await clearTaskmillDirectoryHandle()
        } catch {
          // The current session remains connected; a later reload may require reselecting the folder.
        }
        setWorkspaceError('Папка подключена, но браузер не смог запомнить её. После перезагрузки выберите её снова.')
      }
      workspaceRef.current = workspace
      setConnected(true)
      setSaveStatus('idle')
      replaceConnectedProject(workspace.project)
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== 'AbortError') {
        setWorkspaceError(error instanceof Error ? error.message : 'Не удалось подключить папку .taskmill.')
      }
    } finally {
      setConnectionLoading(false)
    }
  }

  const resumeWorkspace = async () => {
    const directory = savedDirectoryHandleRef.current
    if (!directory) return

    const permissionPromise = directory.requestPermission({ mode: 'readwrite' })
    setConnectionLoading(true)
    setWorkspaceError(undefined)
    try {
      const permission = await permissionPromise
      if (permission !== 'granted') {
        setResumeAvailable(true)
        setWorkspaceError('Браузер не разрешил доступ. Выберите папку ещё раз, чтобы подключить её.')
        return
      }

      const workspace = await TaskmillDirectoryWorkspace.open(directory)
      workspaceRef.current = workspace
      setConnected(true)
      setResumeAvailable(false)
      setSaveStatus('idle')
      replaceConnectedProject(workspace.project)
    } catch (error) {
      setResumeAvailable(true)
      setWorkspaceError(error instanceof Error ? error.message : 'Не удалось восстановить папку .taskmill.')
    } finally {
      setConnectionLoading(false)
    }
  }

  const refreshWorkspace = async () => {
    const currentWorkspace = workspaceRef.current
    if (!currentWorkspace) return

    const saved = await flushPendingSave()
    if (!saved && !window.confirm('Есть локальные изменения, которые не удалось сохранить. Обновление отбросит их. Продолжить?')) return
    if (!saved) pendingSaveRef.current = null
    await saveQueueRef.current

    setWorkspaceError(undefined)
    setConnectionLoading(true)
    try {
      const refreshedWorkspace = await currentWorkspace.refresh()
      workspaceRef.current = refreshedWorkspace
      setSaveStatus('idle')
      replaceConnectedProject(refreshedWorkspace.project)
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : 'Не удалось обновить данные из папки .taskmill.')
    } finally {
      setConnectionLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const restoreWorkspace = async () => {
      try {
        const directory = await loadTaskmillDirectoryHandle()
        if (cancelled || !directory) return
        savedDirectoryHandleRef.current = directory

        const permission = await directory.queryPermission({ mode: 'readwrite' })
        if (permission !== 'granted') {
          setResumeAvailable(true)
          return
        }

        const workspace = await TaskmillDirectoryWorkspace.open(directory)
        if (cancelled) return
        workspaceRef.current = workspace
        connectedProjectIdRef.current = workspace.project.id
        setConnectedProjectId(workspace.project.id)
        setConnected(true)
        replaceProjects([
          ...projectsRef.current.filter((project) => project.id !== workspace.project.id),
          workspace.project,
        ])
        const taskId = workspace.project.tasks[0]?.id ?? ''
        setFallbackSelection({ projectId: workspace.project.id, taskId })
      } catch (error) {
        if (!cancelled) {
          setResumeAvailable(Boolean(savedDirectoryHandleRef.current))
          setWorkspaceError(error instanceof Error ? error.message : 'Не удалось восстановить папку .taskmill.')
        }
      } finally {
        if (!cancelled) setConnectionLoading(false)
      }
    }

    void restoreWorkspace()
    return () => {
      cancelled = true
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [navigate])
  const route = parseTaskRoute(location.pathname)
  const routeProject = route ? projects.find((project) => project.id === route.projectId) : undefined
  const routeTaskId = route ? findTaskId(projects, route.projectId, route.taskSegment) : undefined
  const routeTask = routeProject?.tasks.find((task) => task.id === routeTaskId)
  const selectedProject = route ? routeProject : projects.find((project) => project.id === fallbackSelection.projectId)
  const selectedProjectId = route?.projectId ?? selectedProject?.id ?? fallbackSelection.projectId
  const selectedTaskId = route ? routeTaskId ?? route.taskSegment : fallbackSelection.taskId
  const activePage: AppPage = location.pathname === '/settings'
    ? 'settings'
    : location.pathname === '/blocks'
      ? 'blocks'
      : location.pathname === '/processes'
        ? 'processes'
        : 'task'
  const defaultTaskPath = fallbackSelection.taskId
    ? taskPath(fallbackSelection.projectId, fallbackSelection.taskId)
    : '/processes'
  const selectedTaskPath = selectedProject?.tasks.some((task) => task.id === selectedTaskId)
    ? taskPath(selectedProjectId, selectedTaskId)
    : defaultTaskPath

  const updateProject = (projectId: string, update: (project: Project) => Project) => {
    let updatedProject: Project | undefined
    const nextProjects = projectsRef.current.map((project) => {
      if (project.id !== projectId) return project
      updatedProject = update(project)
      return updatedProject
    })
    replaceProjects(nextProjects)
    if (updatedProject && projectId === connectedProjectIdRef.current) scheduleSave(updatedProject)
  }

  const updatePlugin = (projectId: string, pluginId: string, patch: Partial<ProjectPluginConfig>) => {
    updateProject(projectId, (project) => {
      const config = project.plugins.find((item) => item.pluginId === pluginId)
      const nextConfig: ProjectPluginConfig = config
        ? { ...config, ...patch, values: patch.values ? { ...config.values, ...patch.values } : config.values }
        : { pluginId, enabled: true, values: patch.values ?? {}, comment: patch.comment ?? '' }
      return {
        ...project,
        plugins: config
          ? project.plugins.map((item) => item.pluginId === pluginId ? nextConfig : item)
          : [...project.plugins, nextConfig],
      }
    })
  }

  const updateProcess = (projectId: string, processId: string, patch: Partial<ProcessDefinition>) => {
    updateProject(projectId, (project) => ({
      ...project,
      processes: project.processes.map((process) => process.id === processId ? { ...process, ...patch } : process),
    }))
  }

  const updateTask = (projectId: string, taskId: string, patch: Partial<TaskData>) => {
    updateProject(projectId, (project) => ({
      ...project,
      tasks: project.tasks.map((task) => task.id === taskId ? { ...task, ...patch } : task),
    }))
  }

  const routeContent = useRoutes([
    { path: '/', element: connectionLoading ? null : <Navigate replace to={defaultTaskPath} /> },
    { path: '/tasks', element: connectionLoading ? null : <Navigate replace to={selectedTaskPath} /> },
    {
      path: '/settings',
      element: selectedProject ? <SettingsPage project={selectedProject} /> : <Empty description="Проект не найден" />,
    },
    {
      path: '/blocks',
      element: selectedProject ? (
        <BlocksPage
          project={selectedProject}
          originalProject={mockProjects.find((project) => project.id === selectedProject.id) ?? selectedProject}
          persisted={selectedProject.id === connectedProjectId}
          onUpdatePlugin={(pluginId, patch) => updatePlugin(selectedProject.id, pluginId, patch)}
        />
      ) : <Empty description="Проект не найден" />,
    },
    {
      path: '/processes',
      element: selectedProject ? (
        <ProcessesPage
          project={selectedProject}
          onUpdateProcess={(processId, patch) => updateProcess(selectedProject.id, processId, patch)}
        />
      ) : <Empty description="Проект не найден" />,
    },
    {
      path: '/:projectId/:taskSegment',
      element: routeProject && routeTaskId && routeTask ? (
        <OverviewPage
          project={routeProject}
          projectId={routeProject.id}
          taskId={routeTaskId}
          task={routeTask}
          persisted={routeProject.id === connectedProjectId}
          onUpdateTask={(patch) => updateTask(routeProject.id, routeTaskId, patch)}
        />
      ) : (
        <Empty description="Проект или задача не найдены" />
      ),
    },
    { path: '*', element: <Empty description="Страница не найдена" /> },
  ])

  return (
    <AppLayout
      projects={projects}
      selectedProjectId={selectedProjectId}
      selectedTaskId={selectedTaskId}
      activePage={activePage}
      connected={connected}
      resumeAvailable={resumeAvailable}
      connectionLoading={connectionLoading}
      saveStatus={saveStatus}
      workspaceError={workspaceError}
      onConnect={() => void connectWorkspace()}
      onResume={() => void resumeWorkspace()}
      onRefresh={() => void refreshWorkspace()}
      onSelectTask={(taskId) => {
        if (selectedProject) {
          setFallbackSelection({ projectId: selectedProject.id, taskId })
          navigate(taskPath(selectedProject.id, taskId))
        }
      }}
      onSelectProject={(projectId) => {
        const project = projects.find((item) => item.id === projectId)
        const taskId = project?.tasks[0]?.id
        if (project) {
          setFallbackSelection({ projectId: project.id, taskId: taskId ?? '' })
          if (taskId && activePage === 'task') navigate(taskPath(project.id, taskId))
        }
      }}
      onSelectPage={(page) => {
        if (page === 'task') {
          navigate(selectedTaskPath)
          return
        }

        if (selectedProject && selectedTaskId) {
          setFallbackSelection({ projectId: selectedProject.id, taskId: selectedTaskId })
        }
        navigate(`/${page}`)
      }}
    >
      {routeContent}
    </AppLayout>
  )
}
