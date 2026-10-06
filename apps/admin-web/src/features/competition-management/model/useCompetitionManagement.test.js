import assert from 'node:assert/strict'
import test from 'node:test'

import { useCompetitionManagement } from './useCompetitionManagement.js'

function createCompetitionModel(apiOverrides = {}) {
  const calls = []
  const messages = []
  const api = {
    async fetchCompetitions(params) {
      calls.push(['list', params])
      return {
        items: [{
          id: 1,
          title: '少儿科创赛',
          status: 'DRAFT',
          location: '南昌',
          maxParticipants: 20
        }]
      }
    },
    async fetchCompetition(competitionId) {
      calls.push(['detail', competitionId])
      return {
        id: competitionId,
        title: '少儿科创赛',
        scopeType: 'PLATFORM',
        registrationEndAt: '2026-08-01T09:00:00',
        status: 'DRAFT'
      }
    },
    async createCompetition(payload) {
      calls.push(['create', payload])
      return { id: 3, status: 'DRAFT', ...payload }
    },
    async updateCompetition(competitionId, payload) {
      calls.push(['update', competitionId, payload])
      return { id: competitionId, ...payload }
    },
    async publishCompetition(competitionId) {
      calls.push(['publish', competitionId])
      return { id: competitionId, title: '少儿科创赛', status: 'PUBLISHED' }
    },
    async offlineCompetition(competitionId) {
      calls.push(['offline', competitionId])
      return { id: competitionId, title: '少儿科创赛', status: 'OFFLINE' }
    },
    async updateCompetitionInfoUrl(competitionId, payload) {
      calls.push(['info-url', competitionId, payload])
      return { id: competitionId, ...payload }
    },
    async deleteCompetition(competitionId) {
      calls.push(['delete', competitionId])
    },
    async fetchSchools(params) {
      calls.push(['schools', params])
      return {
        items: [
          { id: 2, name: '山前幼儿园', status: 'ACTIVE' },
          { id: 3, name: '青山幼儿园', status: 'DISABLED' }
        ]
      }
    },
    async fetchCompetitionRegistrations(competitionId, params) {
      calls.push(['registrations', competitionId, params])
      return {
        items: [{ id: 5, studentName: '小山' }],
        total: 21
      }
    },
    async fetchParentRegistrations(parentId) {
      calls.push(['parent-registrations', parentId])
      return [{ id: 6, studentName: '小林' }]
    },
    async exportCompetitions(filter) {
      calls.push(['export', filter])
      return { blob: new Blob(['competitions']), filename: 'competitions.csv' }
    },
    ...apiOverrides
  }
  const model = useCompetitionManagement({
    api,
    dialogs: {
      async confirm(...args) {
        calls.push(['confirm', ...args])
      },
      async prompt(message, title, options) {
        calls.push(['prompt', message, title, options])
        return {
          value: title === '设置信息链接'
            ? 'https://example.com/info'
            : '9'
        }
      }
    },
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      success(message) {
        messages.push(['success', message])
      }
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save-file', result.filename, fallbackFilename])
    }
  })

  return { calls, messages, model }
}

test('competition management initializes list and active school scopes', async () => {
  const { calls, model } = createCompetitionModel()
  model.keyword.value = ' 科创 '

  await model.initialize()
  model.status.value = 'DRAFT'

  assert.ok(calls.some(call => (
    call[0] === 'list' && call[1].keyword === '科创'
  )))
  assert.ok(calls.some(call => (
    call[0] === 'schools' && call[1].status === 'ACTIVE'
  )))
  assert.deepEqual(model.schoolScopeOptions.value, [{
    value: 2,
    label: '山前幼儿园'
  }])
  assert.deepEqual(model.filteredRows.value.map(row => row.id), [1])
})

test('competition management exports current filters', async () => {
  const { calls, messages, model } = createCompetitionModel()
  model.keyword.value = ' 科创 '
  model.status.value = 'PUBLISHED'

  assert.equal(await model.exportCompetitions(), true)
  assert.deepEqual(calls, [
    ['export', { keyword: '科创', status: 'PUBLISHED' }],
    ['save-file', 'competitions.csv', '赛事列表.csv']
  ])
  assert.deepEqual(messages, [['success', '赛事数据已导出']])
})

test('competition management creates strict school competition payloads', async () => {
  const { calls, messages, model } = createCompetitionModel()
  model.openCreate()
  Object.assign(model.form, {
    title: ' 学校科创赛 ',
    scopeType: 'SCHOOL',
    schoolId: '2',
    registrationEndAt: '2026-08-01T09:00:00',
    maxParticipants: 30
  })

  assert.equal(await model.saveCompetition(), true)
  assert.deepEqual(calls, [[
    'create',
    {
      title: '学校科创赛',
      schoolId: 2,
      scopeType: 'SCHOOL',
      registrationEndAt: '2026-08-01T09:00:00',
      maxParticipants: 30
    }
  ]])
  assert.equal(model.rows.value[0].title, '学校科创赛')
  assert.deepEqual(messages, [['success', '赛事已保存']])
})

test('competition management recovers a competition saved before a response error', async () => {
  const savedCompetition = {
    id: 7,
    title: '平台科创赛',
    scopeType: 'PLATFORM',
    registrationEndAt: '2026-08-01T09:00:00',
    maxParticipants: 1
  }
  const { messages, model } = createCompetitionModel({
    async createCompetition() {
      throw new Error('响应中断')
    },
    async fetchCompetitions() {
      return { items: [savedCompetition] }
    },
    async fetchCompetition() {
      return savedCompetition
    }
  })
  Object.assign(model.form, {
    title: savedCompetition.title,
    registrationEndAt: savedCompetition.registrationEndAt
  })

  assert.equal(await model.saveCompetition(), true)
  assert.equal(model.rows.value[0].id, 7)
  assert.deepEqual(messages, [['success', '赛事已保存']])
})

test('competition management owns publish, offline, link and delete actions', async () => {
  const { calls, model } = createCompetitionModel()
  const row = { id: 1, title: '少儿科创赛', status: 'DRAFT' }

  assert.equal(await model.publishCompetition(row), true)
  assert.equal(await model.offlineCompetition({ ...row, status: 'PUBLISHED' }), true)
  assert.equal(await model.setInfoUrl(row), true)
  model.rows.value = [{ ...row, status: 'OFFLINE' }]
  model.selectedRow.value = model.rows.value[0]
  assert.equal(await model.removeCompetition(model.rows.value[0]), true)

  assert.ok(calls.some(call => call[0] === 'publish' && call[1] === 1))
  assert.ok(calls.some(call => call[0] === 'offline' && call[1] === 1))
  assert.ok(calls.some(call => (
    call[0] === 'info-url'
    && call[2].infoUrl === 'https://example.com/info'
  )))
  assert.ok(calls.some(call => call[0] === 'delete' && call[1] === 1))
  assert.equal(model.selectedRow.value, null)
})

test('competition management recovers a completed publication after an error', async () => {
  const { messages, model } = createCompetitionModel({
    async publishCompetition() {
      throw new Error('响应中断')
    },
    async fetchCompetition(competitionId) {
      return {
        id: competitionId,
        title: '少儿科创赛',
        status: 'PUBLISHED'
      }
    }
  })

  assert.equal(await model.publishCompetition({
    id: 1,
    title: '少儿科创赛'
  }), true)
  assert.deepEqual(messages, [['success', '赛事已发布']])
  assert.equal(model.rows.value[0].status, 'PUBLISHED')
})

test('competition management paginates competition and parent registrations', async () => {
  const { calls, model } = createCompetitionModel()
  model.registrationKeyword.value = ' 小山 '

  assert.equal(await model.openRegistrations({
    id: 1,
    title: '少儿科创赛'
  }), true)
  model.registrationKeyword.value = ' 小山 '
  assert.equal(await model.loadCompetitionRegistrations(2), true)
  assert.equal(model.registrationPage.value, 2)
  assert.equal(model.registrationTotal.value, 21)
  assert.equal(model.registrationRows.value[0].studentName, '小山')
  assert.equal(await model.openParentRegistrations(), true)
  assert.equal(model.registrationRows.value[0].studentName, '小林')
  assert.equal(model.registrationDialogTitle.value, '报名明细 - 家长 #9')

  assert.ok(calls.some(call => (
    call[0] === 'registrations'
    && call[2].page === 2
    && call[2].pageSize === 20
    && call[2].keyword === '小山'
  )))
  assert.ok(calls.some(call => call[0] === 'parent-registrations' && call[1] === '9'))
})

test('competition management rejects deletion before a competition is offline', async () => {
  const { calls, messages, model } = createCompetitionModel()

  assert.equal(await model.removeCompetition({
    id: 1,
    title: '少儿科创赛',
    status: 'DRAFT'
  }), false)
  assert.ok(!calls.some(call => call[0] === 'delete'))
  assert.deepEqual(messages, [['error', '只有下线赛事可以删除']])
})
