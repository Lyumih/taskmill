import { Empty } from 'antd'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useRoutes } from 'react-router'
import { mockProjects } from '../../../mock'
import type { ProcessDefinition } from '../../types/process'
import type { Project, ProjectPluginConfig } from '../../types/project'
import type { TaskData } from '../../types/task'
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
  const [fallbackSelection, setFallbackSelection] = useState({
    projectId: defaultProject?.id ?? '',
    taskId: defaultTaskId,
  })
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
  const defaultTaskPath = taskPath(fallbackSelection.projectId, fallbackSelection.taskId)
  const selectedTaskPath = selectedProject?.tasks.some((task) => task.id === selectedTaskId)
    ? taskPath(selectedProjectId, selectedTaskId)
    : defaultTaskPath

  const updateProject = (projectId: string, update: (project: Project) => Project) => {
    setProjects((current) => current.map((project) => project.id === projectId ? update(project) : project))
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
    { path: '/', element: <Navigate replace to={defaultTaskPath} /> },
    { path: '/tasks', element: <Navigate replace to={selectedTaskPath} /> },
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
