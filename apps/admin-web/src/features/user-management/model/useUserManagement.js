import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { userManagementApi } from '../api/userManagementApi.js'
import { useUserAccountActions } from './useUserAccountActions.js'
import { useUserDirectory } from './useUserDirectory.js'
import { useUserEditor } from './useUserEditor.js'

const silentFeedback = {
  error() {},
  success() {},
  warning() {}
}

const silentDialogs = {
  async alert() {},
  async confirm() {}
}

export function useUserManagement({
  api = userManagementApi,
  dialogs = silentDialogs,
  feedback = silentFeedback,
  onUnauthorized = () => {},
  saveFile = saveBrowserFile
} = {}) {
  const directory = useUserDirectory({
    api,
    feedback,
    onUnauthorized,
    saveFile
  })
  const editor = useUserEditor({
    api,
    feedback,
    handleAdminActionError: directory.handleAdminActionError,
    rows: directory.rows
  })
  const accountActions = useUserAccountActions({
    api,
    dialogs,
    feedback,
    loadData: directory.loadData,
    reportActionError: directory.reportActionError
  })

  return {
    ...directory,
    ...editor,
    ...accountActions
  }
}
