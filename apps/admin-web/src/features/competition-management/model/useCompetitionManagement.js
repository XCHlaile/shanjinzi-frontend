import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { competitionManagementApi } from '../api/competitionManagementApi.js'
import { useCompetitionActions } from './useCompetitionActions.js'
import { useCompetitionDirectory } from './useCompetitionDirectory.js'
import { useCompetitionEditor } from './useCompetitionEditor.js'
import { useCompetitionRegistrations } from './useCompetitionRegistrations.js'

const silentFeedback = {
  error() {},
  success() {}
}

const silentDialogs = {
  async confirm() {},
  async prompt() {
    return { value: '' }
  }
}

export function useCompetitionManagement({
  api = competitionManagementApi,
  dialogs = silentDialogs,
  feedback = silentFeedback,
  saveFile = saveBrowserFile
} = {}) {
  const directory = useCompetitionDirectory({ api, feedback, saveFile })
  const editor = useCompetitionEditor({
    api,
    feedback,
    rows: directory.rows
  })
  const actions = useCompetitionActions({
    api,
    dialogs,
    feedback,
    rows: directory.rows,
    selectedRow: directory.selectedRow
  })
  const registrations = useCompetitionRegistrations({
    api,
    dialogs,
    feedback
  })

  function initialize() {
    return Promise.all([directory.loadData(), editor.loadScopeOptions()])
  }

  return {
    ...directory,
    ...editor,
    ...actions,
    ...registrations,
    initialize
  }
}
