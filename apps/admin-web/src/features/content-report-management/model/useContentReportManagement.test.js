import assert from 'node:assert/strict'
import test from 'node:test'

import { useContentReportManagement } from './useContentReportManagement.js'

function createReportModel({ apiOverrides = {}, confirm } = {}) {
  const calls = []
  const messages = []
  const api = {
    async fetchSchools(params) {
      calls.push(['schools', params])
      return { items: [{ id: 2, name: '山前幼儿园' }] }
    },
    async fetchSchool(schoolId) {
      calls.push(['school', schoolId])
      return { id: schoolId, name: '青山幼儿园' }
    },
    async fetchReports(params) {
      calls.push(['reports', params])
      return {
        total: 1,
        items: [{ reportId: 3, schoolId: 2, status: 'PENDING' }]
      }
    },
    async fetchReport(reportId) {
      calls.push(['report', reportId])
      return { reportId, schoolId: 4, status: 'PENDING' }
    },
    async handleReport(reportId, payload) {
      calls.push(['handle', reportId, payload])
      return { reportId, status: 'IGNORED', handledAction: payload.action }
    },
    ...apiOverrides
  }
  const model = useContentReportManagement({
    api,
    confirmation: {
      async confirm(...args) {
        calls.push(['confirm', ...args])
        if (confirm) return confirm(...args)
      }
    },
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      success(message) {
        messages.push(['success', message])
      }
    }
  })

  return { calls, messages, model }
}

test('content report management initializes schools and report pages', async () => {
  const { calls, model } = createReportModel()

  assert.equal(await model.initialize(), true)

  assert.deepEqual(calls, [
    ['schools', { page: 1, pageSize: 100 }],
    ['reports', {
      schoolId: undefined,
      status: undefined,
      targetType: undefined,
      page: 1,
      pageSize: 20
    }]
  ])
  assert.deepEqual(model.schoolOptions.value, [{ value: 2, label: '山前幼儿园' }])
  assert.equal(model.reportSchoolName(model.rows.value[0]), '山前幼儿园')
  assert.equal(model.pagination.total, 1)
})

test('content report management resets pagination for search and page size', async () => {
  const { calls, model } = createReportModel()
  Object.assign(model.filters, {
    schoolId: 2,
    status: 'PENDING',
    targetType: 'MOMENT'
  })
  model.pagination.page = 3

  await model.searchReports()
  assert.equal(model.pagination.page, 1)
  assert.deepEqual(calls[0], ['reports', {
    schoolId: 2,
    status: 'PENDING',
    targetType: 'MOMENT',
    page: 1,
    pageSize: 20
  }])

  model.pagination.page = 4
  model.pagination.pageSize = 50
  await model.handlePageSizeChange()
  assert.equal(model.pagination.page, 1)

  await model.resetFilters()
  assert.deepEqual({ ...model.filters }, {
    schoolId: null,
    status: '',
    targetType: ''
  })
})

test('content report management loads detail and resolves a missing school name', async () => {
  const { calls, model } = createReportModel()

  assert.equal(await model.openDetail({ reportId: 3 }), true)

  assert.deepEqual(calls, [
    ['report', 3],
    ['school', 4]
  ])
  assert.equal(model.reportDetail.value.reportId, 3)
  assert.equal(model.reportSchoolName(model.reportDetail.value), '青山幼儿园')
  assert.equal(model.detailLoading.value, false)
})

test('content report management validates, confirms, and submits handling', async () => {
  const { calls, messages, model } = createReportModel()
  model.openHandle({ reportId: 3 })

  assert.equal(await model.submitHandle(), false)
  Object.assign(model.handleForm, { action: ' IGNORE ', note: ' 无需处理 ' })
  assert.equal(await model.submitHandle(), true)

  assert.deepEqual(calls, [
    [
      'confirm',
      '同一举报只能处理一次，确认提交当前处理结果？',
      '确认处理',
      { type: 'warning' }
    ],
    ['handle', 3, { action: 'IGNORE', note: '无需处理' }],
    ['reports', {
      schoolId: undefined,
      status: undefined,
      targetType: undefined,
      page: 1,
      pageSize: 20
    }]
  ])
  assert.deepEqual(messages, [
    ['error', '请输入处理动作 action'],
    ['success', '举报已处理']
  ])
  assert.equal(model.handleVisible.value, false)
  assert.equal(model.handling.value, false)
})

test('content report management treats dialog cancellation as a no-op', async () => {
  const { calls, messages, model } = createReportModel({
    confirm() {
      throw 'cancel'
    }
  })
  model.openHandle({ reportId: 3 })
  model.handleForm.action = 'IGNORE'

  assert.equal(await model.submitHandle(), false)
  assert.equal(calls.some(([operation]) => operation === 'handle'), false)
  assert.deepEqual(messages, [])
})

test('content report management clears stale rows after a load failure', async () => {
  const { messages, model } = createReportModel({
    apiOverrides: {
      async fetchReports() {
        throw new Error('举报服务不可用')
      }
    }
  })
  model.rows.value = [{ reportId: 9 }]
  model.pagination.total = 1

  assert.equal(await model.loadReports(), false)
  assert.deepEqual(model.rows.value, [])
  assert.equal(model.pagination.total, 0)
  assert.equal(model.loadError.value, '举报服务不可用')
  assert.deepEqual(messages, [['error', '举报服务不可用']])
})
