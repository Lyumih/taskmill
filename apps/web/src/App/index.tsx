import { useState } from 'react'
import { Empty } from 'antd'
import { mockProjects } from '../../mock'
import { AppLayout } from '../layouts/AppLayout'
import type { AppPage } from '../layouts/AppLayout'
import { BlocksPage } from '../pages/BlocksPage'
import { OverviewPage } from '../pages/OverviewPage'
import { ProcessesPage } from '../pages/ProcessesPage'
import { SettingsPage } from '../pages/SettingsPage'

function App() {
  const initialProject = mockProjects[0]
  const [projectId, setProjectId] = useState(initialProject?.id ?? '')
  const [taskId, setTaskId] = useState(initialProject?.tasks[0]?.id ?? '')
  const [activePage, setActivePage] = useState<AppPage>('task')
  const selectedProject = mockProjects.find((project) => project.id === projectId)

  const handleProjectSelect = (nextProjectId: string) => {
    const nextProject = mockProjects.find((project) => project.id === nextProjectId)

    setProjectId(nextProjectId)
    setTaskId(nextProject?.tasks[0]?.id ?? '')
  }

  return (
    <AppLayout
      projects={mockProjects}
      selectedProjectId={projectId}
      selectedTaskId={taskId}
      activePage={activePage}
      onSelectTask={(nextTaskId) => {
        setTaskId(nextTaskId)
        setActivePage('task')
      }}
      onSelectProject={handleProjectSelect}
      onSelectPage={setActivePage}
    >
      {selectedProject ? (
        <div hidden={activePage !== 'settings'}>
          <SettingsPage project={selectedProject} />
        </div>
      ) : null}
      {selectedProject ? (
        <div hidden={activePage !== 'blocks'}>
          <BlocksPage project={selectedProject} />
        </div>
      ) : null}
      {selectedProject ? (
        <div hidden={activePage !== 'processes'}>
          <ProcessesPage project={selectedProject} />
        </div>
      ) : null}
      {activePage === 'task' && selectedProject && taskId ? (
        <OverviewPage project={selectedProject} projectId={projectId} taskId={taskId} />
      ) : null}
      {activePage === 'task' && (!selectedProject || !taskId) ? (
        <Empty description="В выбранном проекте пока нет задач" />
      ) : null}
    </AppLayout>
  )
}

export default App
