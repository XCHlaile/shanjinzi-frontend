import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useStudentRosterTransfers } from './useStudentRosterTransfers.js'

function createTransferModel(overrides = {}) {
  const calls = []
  const successes = []
  const errors = []
  const api = {
    async listOpenStudentImportBatches(options) {
      calls.push(['list-batches', options])
      return { items: [{ id: 12, status: 'COMPLETED' }] }
    },
    async importOpenStudents(payload) {
      calls.push(['import', payload])
      return { id: 13 }
    },
    async downloadOpenStudentImportTemplate() {
      calls.push(['download-template'])
      return { blob: new Blob(['template']), filename: 'students.xlsx' }
    },
    ...overrides.api
  }
  const exportApi = {
    async createOpenExportTask(payload) {
      calls.push(['export', payload])
      return { taskId: 14 }
    },
    ...overrides.exportApi
  }
  const model = useStudentRosterTransfers({
    keyword: ref('小明'),
    statusFilter: ref('ENABLED'),
    reloadRows: async () => { calls.push(['reload-rows']) },
    api,
    exportApi,
    downloadFile: (...args) => { calls.push(['download-file', ...args]) },
    notify: {
      success(message) { successes.push(message) },
      error(message) { errors.push(message) }
    }
  })
  return { calls, errors, model, successes }
}

test('student roster transfers load batches when opening the import dialog', async () => {
  const { calls, model } = createTransferModel()

  await model.openImportBatches()

  assert.equal(model.batchDialog.value, true)
  assert.equal(model.batchError.value, '')
  assert.deepEqual(model.importBatches.value, [{ id: 12, status: 'COMPLETED' }])
  assert.deepEqual(calls, [['list-batches', { page: 1, pageSize: 100 }]])
})

test('student roster transfers submit the selected file then refresh data', async () => {
  const { calls, model, successes } = createTransferModel()
  const file = new Blob(['students'])
  model.studentImportFile.value = file
  model.studentImportForm.autoCreateClass = true
  model.studentImportForm.remark = '新学期'

  await model.submitStudentImport()

  assert.deepEqual(calls, [
    ['import', { file, autoCreateClass: true, remark: '新学期' }],
    ['list-batches', { page: 1, pageSize: 100 }],
    ['reload-rows']
  ])
  assert.equal(model.studentImportFile.value, null)
  assert.equal(model.studentImportForm.remark, '')
  assert.equal(model.importInputKey.value, 1)
  assert.deepEqual(successes, ['学生导入批次 #13 已创建'])
})

test('student roster transfers download templates and create filtered exports', async () => {
  const { calls, model, successes } = createTransferModel()

  await model.downloadStudentImportTemplate()
  await model.createStudentExport()

  assert.equal(calls[0][0], 'download-template')
  assert.equal(calls[1][0], 'download-file')
  assert.deepEqual(calls[2], [
    'export',
    {
      taskType: 'STUDENTS',
      scopeType: 'SCHOOL',
      filterJson: { keyword: '小明', status: 'ENABLED' }
    }
  ])
  assert.match(successes[0], /导入模板/)
  assert.match(successes[1], /#14/)
})
