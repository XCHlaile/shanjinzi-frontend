import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useOperationsManagement } from './useOperationsManagement.js'

test('operations facade wires directory context into task management', () => {
  const calls = []
  const notify = { success() {}, error() {} }
  const directory = {
    activeTab: ref('audit'),
    ensureAuditUserNames: async () => {},
    loadAuditLogs: async () => {},
    loadExportTasks: async () => {},
    operatorLabel: () => 'operator',
    targetLabel: () => 'target'
  }
  const tasks = {
    creatingTask: ref(false)
  }

  const facade = useOperationsManagement({
    notify,
    createDirectory() {
      calls.push('directory')
      return directory
    },
    createTasks(options) {
      calls.push('tasks')
      assert.equal(options.activeTab, directory.activeTab)
      assert.equal(options.ensureAuditUserNames, directory.ensureAuditUserNames)
      assert.equal(options.loadExportTasks, directory.loadExportTasks)
      assert.equal(options.operatorLabel, directory.operatorLabel)
      assert.equal(options.targetLabel, directory.targetLabel)
      assert.equal(options.notify, notify)
      return tasks
    }
  })

  assert.deepEqual(calls, ['directory', 'tasks'])
  assert.equal(facade.activeTab, directory.activeTab)
  assert.equal(facade.creatingTask, tasks.creatingTask)
})
