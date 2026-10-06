import { useOperationsDirectory } from './useOperationsDirectory.js'
import { useOperationsTasks } from './useOperationsTasks.js'

export function useOperationsManagement({
  notify = { success() {}, error() {} },
  createDirectory = useOperationsDirectory,
  createTasks = useOperationsTasks
} = {}) {
  const directory = createDirectory()
  const tasks = createTasks({
    activeTab: directory.activeTab,
    ensureAuditUserNames: directory.ensureAuditUserNames,
    targetLabel: directory.targetLabel,
    operatorLabel: directory.operatorLabel,
    loadExportTasks: directory.loadExportTasks,
    notify
  })

  return {
    ...directory,
    ...tasks
  }
}
