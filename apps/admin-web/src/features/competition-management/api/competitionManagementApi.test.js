import assert from 'node:assert/strict'
import test from 'node:test'

import { createCompetitionManagementApi } from './competitionManagementApi.js'

test('competition management api adapts competitions, scope options and registrations', async () => {
  const calls = []
  const managementApi = Object.fromEntries([
    'listCompetitions',
    'getCompetition',
    'createCompetition',
    'updateCompetition',
    'publishCompetition',
    'offlineCompetition',
    'updateCompetitionInfoUrl',
    'deleteCompetition',
    'listSchools',
    'listCompetitionRegistrations',
    'listParentCompetitionRegistrations'
  ].map(operation => [operation, async (...args) => {
    calls.push([operation, ...args])
    return { operation }
  }]))
  const api = createCompetitionManagementApi({ managementApi })

  await api.fetchCompetitions({ page: 1 })
  await api.fetchCompetition(2)
  await api.createCompetition({ title: '科创赛' })
  await api.updateCompetition(2, { title: '新名称' })
  await api.publishCompetition(2)
  await api.offlineCompetition(2)
  await api.updateCompetitionInfoUrl(2, { infoUrl: 'https://example.com' })
  await api.deleteCompetition(2)
  await api.fetchSchools({ status: 'ACTIVE' })
  await api.fetchCompetitionRegistrations(2, { page: 3 })
  await api.fetchParentRegistrations(9)

  assert.deepEqual(calls, [
    ['listCompetitions', { page: 1 }],
    ['getCompetition', 2],
    ['createCompetition', { title: '科创赛' }],
    ['updateCompetition', 2, { title: '新名称' }],
    ['publishCompetition', 2],
    ['offlineCompetition', 2],
    ['updateCompetitionInfoUrl', 2, { infoUrl: 'https://example.com' }],
    ['deleteCompetition', 2],
    ['listSchools', { status: 'ACTIVE' }],
    ['listCompetitionRegistrations', 2, { page: 3 }],
    ['listParentCompetitionRegistrations', 9]
  ])
})

test('competition management api waits for and downloads asynchronous exports', async () => {
  const calls = []
  const api = createCompetitionManagementApi({
    async createExport(taskType, filter) {
      calls.push(['create-export', taskType, filter])
      return { id: 8, status: 'PENDING' }
    },
    async waitForExport(taskId) {
      calls.push(['wait-export', taskId])
      return { id: taskId, status: 'COMPLETED' }
    },
    async downloadExport(taskId) {
      calls.push(['download-export', taskId])
      return { blob: new Blob(['competitions']) }
    }
  })

  assert.ok((await api.exportCompetitions({ status: 'PUBLISHED' })).blob instanceof Blob)
  assert.deepEqual(calls, [
    ['create-export', 'COMPETITIONS', { status: 'PUBLISHED' }],
    ['wait-export', 8],
    ['download-export', 8]
  ])
})

test('competition management api downloads completed exports immediately', async () => {
  const calls = []
  const api = createCompetitionManagementApi({
    async createExport() {
      return { id: 9, status: 'COMPLETED' }
    },
    async waitForExport() {
      calls.push(['wait'])
    },
    async downloadExport(taskId) {
      calls.push(['download', taskId])
      return { blob: new Blob(['competitions']) }
    }
  })

  await api.exportCompetitions({})
  assert.deepEqual(calls, [['download', 9]])
})
