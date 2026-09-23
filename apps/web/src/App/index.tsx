import { useState } from 'react'
import { Empty } from 'antd'
import { mockProjects } from '../../mock'
import { AppLayout } from '../layouts/AppLayout'
import { OverviewPage } from '../pages/OverviewPage'

function App() {
  const initialProject = mockProjects[0]
  const [projectId, setProjectId] = useState(initialProject?.id ?? '')
  const [taskId, setTaskId] = useState(initialProject?.tasks[0]?.id ?? '')
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
      onSelectTask={setTaskId}
      onSelectProject={handleProjectSelect}
    >
      {selectedProject && taskId ? (
        <OverviewPage project={selectedProject} projectId={projectId} taskId={taskId} />
      ) : (
        <Empty description="В выбранном проекте пока нет задач" />
      )}
    </AppLayout>
  )
}

export default App
