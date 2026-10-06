import assert from 'node:assert/strict'
import test from 'node:test'

import { useActivityDirectory } from './useActivityDirectory.js'

function activity(id, overrides = {}) {
  return {
    momentId: id,
    authorName: `用户${id}`,
    content: `动态${id}`,
    ...overrides
  }
}

test('activity directory loads the visible student feed and focuses a requested moment', async () => {
  const calls = []
  let resetCount = 0
  const directory = useActivityDirectory({
    role: 'parent',
    currentStudent: { studentId: 18 },
    initialUser: { id: 2, role: 'parent' },
    requestedMomentId: () => '9',
    api: {
      async fetchActivities(query, options) {
        calls.push(['visible', query, options])
        return {
          items: [activity(7)],
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1
        }
      },
      async fetchActivityDetail(momentId) {
        calls.push(['detail', momentId])
        return activity(9)
      }
    },
    scrollToMoment(momentId) {
      calls.push(['focus', momentId])
    }
  })
  directory.setActiveMomentReset(() => {
    resetCount += 1
  })

  await directory.loadActivities()

  assert.deepEqual(calls, [
    ['visible', { page: 1, pageSize: 20 }, { currentStudentId: 18 }],
    ['detail', '9'],
    ['focus', 9]
  ])
  assert.deepEqual(directory.activityList.value.map(item => item.id), [9, 7])
  assert.equal(directory.pagination.total, 1)
  assert.equal(directory.isSourceTarget(9), true)
  assert.equal(resetCount, 1)
})

test('activity directory switches to owned activities and changes page', async () => {
  const calls = []
  const directory = useActivityDirectory({
    role: 'teacher',
    currentStudent: null,
    api: {
      async fetchMyActivities(query, options) {
        calls.push(['mine', query, options])
        return {
          items: [activity(query.page)],
          page: query.page,
          pageSize: 20,
          total: 40,
          totalPages: 2
        }
      }
    },
    scrollToTop() {
      calls.push(['top'])
    }
  })

  await directory.switchList('mine')
  await directory.changePage(2)

  assert.deepEqual(calls, [
    ['mine', { page: 1, pageSize: 20 }, { currentStudentId: '' }],
    ['mine', { page: 2, pageSize: 20 }, { currentStudentId: '' }],
    ['top']
  ])
  assert.equal(directory.listMode.value, 'mine')
  assert.equal(directory.listEndpoint.value, 'GET /api/app/moments/mine')
  assert.equal(directory.pagination.page, 2)
})

test('activity directory refreshes the school context before initialization', async () => {
  const calls = []
  const directory = useActivityDirectory({
    role: 'school',
    currentStudent: null,
    initialUser: { id: 3, role: 'school' },
    async refreshUser() {
      calls.push('refresh')
      return { id: 3, role: 'school', school: { schoolId: 26 } }
    },
    api: {
      async fetchActivities() {
        calls.push('activities')
        return { items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 }
      }
    }
  })
  directory.setRelatedLoader(async () => {
    calls.push(['related', directory.currentSchoolId.value])
  })

  await directory.initialize()

  assert.equal(directory.currentSchoolId.value, 26)
  assert.deepEqual(calls, ['refresh', 'activities', ['related', 26]])
})

test('activity directory clears stale data when loading fails', async () => {
  const directory = useActivityDirectory({
    role: 'parent',
    currentStudent: { id: 5 },
    api: {
      async fetchActivities() {
        throw new Error('网络不可用')
      }
    }
  })
  directory.activityList.value = [activity(1)]
  directory.pagination.total = 1
  directory.pagination.totalPages = 1

  await directory.loadActivities()

  assert.deepEqual(directory.activityList.value, [])
  assert.equal(directory.pagination.total, 0)
  assert.equal(directory.pagination.totalPages, 0)
  assert.equal(directory.loadError.value, '网络不可用')
  assert.equal(directory.loading.value, false)
})
