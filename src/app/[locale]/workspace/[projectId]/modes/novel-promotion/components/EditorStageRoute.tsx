'use client'

import { VideoEditorStage } from '@/features/video-editor/components/VideoEditorStage'
import { useWorkspaceProvider } from '../WorkspaceProvider'
import { useWorkspaceStageRuntime } from '../WorkspaceStageRuntimeContext'

export default function EditorStageRoute() {
  const { projectId, episodeId } = useWorkspaceProvider()
  const runtime = useWorkspaceStageRuntime()

  if (!episodeId) return null

  return (
    <VideoEditorStage
      projectId={projectId}
      episodeId={episodeId}
      onBack={() => runtime.onStageChange('videos')}
    />
  )
}
