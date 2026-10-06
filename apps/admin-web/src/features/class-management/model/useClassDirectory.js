import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { useClassActions } from './useClassActions.js'
import { useClassEditor } from './useClassEditor.js'
import { useClassList } from './useClassList.js'

export function useClassDirectory({
  api,
  dialogs,
  feedback,
  handleAdminError,
  onRowsLoaded = () => {},
  saveFile = saveBrowserFile
}) {
  const classList = useClassList({
    api,
    feedback,
    handleAdminError,
    onRowsLoaded,
    saveFile
  })
  const editor = useClassEditor({
    api,
    feedback,
    filters: classList.filters,
    handleAdminError,
    loadClasses: classList.loadClasses,
    rows: classList.rows
  })
  const actions = useClassActions({
    api,
    dialogs,
    feedback,
    handleAdminError,
    loadClasses: classList.loadClasses,
    pagination: classList.pagination,
    rows: classList.rows
  })

  return {
    ...classList,
    ...editor,
    ...actions
  }
}
