import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { newsManagementApi } from '../api/newsManagementApi.js'
import { useNewsArticleActions } from './useNewsArticleActions.js'
import { useNewsCategoryManagement } from './useNewsCategoryManagement.js'
import { useNewsDirectory } from './useNewsDirectory.js'
import { useNewsEditor } from './useNewsEditor.js'

const silentFeedback = {
  error() {},
  success() {}
}

const silentDialogs = {
  async confirm() {}
}

export function useNewsManagement({
  api = newsManagementApi,
  dialogs = silentDialogs,
  feedback = silentFeedback,
  onUnauthorized = () => {},
  saveFile = saveBrowserFile
} = {}) {
  const directory = useNewsDirectory({
    api,
    feedback,
    onUnauthorized,
    saveFile
  })
  const editor = useNewsEditor({
    api,
    categories: directory.categories,
    defaultCategoryId: directory.defaultCategoryId,
    feedback,
    handleAdminError: directory.handleAdminError,
    loadCategories: directory.loadCategories,
    refreshNewsListAfterSave: directory.refreshNewsListAfterSave,
    rows: directory.rows
  })
  const articleActions = useNewsArticleActions({
    api,
    defaultCategoryId: directory.defaultCategoryId,
    dialogs,
    feedback,
    handleAdminError: directory.handleAdminError,
    loadData: directory.loadData
  })
  const categoryManagement = useNewsCategoryManagement({
    api,
    categories: directory.categories,
    dialogs,
    feedback,
    handleAdminError: directory.handleAdminError,
    loadCategories: directory.loadCategories,
    refreshCategoriesAfterSave: directory.refreshCategoriesAfterSave
  })

  return {
    ...directory,
    ...editor,
    ...articleActions,
    ...categoryManagement
  }
}
