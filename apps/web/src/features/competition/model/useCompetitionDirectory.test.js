import assert from 'node:assert/strict'
import test from 'node:test'

import { useCompetitionDirectory } from './useCompetitionDirectory.js'

test('competition directory loads the parent list and focuses a requested item', async () => {
  const calls = []
  const directory = useCompetitionDirectory({
    role: 'parent',
    getRequestedCompetitionId: () => '7',
    api: {
      async fetchCompetitions(options) {
        calls.push(['list', options])
        return { items: [{ competitionId: 7, title: '亲子运动会' }] }
      }
    },
    focusTarget: async id => calls.push(['focus', id])
  })

  await directory.loadCompetitions()

  assert.deepEqual(calls, [
    ['list', { page: 1, pageSize: 100 }],
    ['focus', 7]
  ])
  assert.equal(directory.competitions.value[0].name, '亲子运动会')
  assert.equal(directory.isSourceTarget(7), true)
  assert.equal(directory.loading.value, false)
})

test('competition directory enriches public lists and loads a missing route target', async () => {
  const calls = []
  const directory = useCompetitionDirectory({
    role: 'school',
    getRequestedCompetitionId: () => 9,
    api: {
      async fetchPublicCompetitions(options) {
        calls.push(['list', options])
        return { records: [{ id: 8, name: '跳绳比赛' }] }
      },
      async fetchPublicCompetitionRegistrationCount(id) {
        calls.push(['stats', id])
        return { total: 12, approved: 10 }
      },
      async fetchPublicCompetitionDetail(id) {
        calls.push(['detail', id])
        return { id, name: '接力比赛' }
      }
    },
    focusTarget: async id => calls.push(['focus', id])
  })

  await directory.loadCompetitions()

  assert.deepEqual(calls, [
    ['list', { page: 1, pageSize: 100 }],
    ['stats', 8],
    ['detail', 9],
    ['focus', 9]
  ])
  assert.deepEqual(directory.competitions.value.map(item => item.id), [9, 8])
  assert.equal(directory.competitions.value[1].registered, 12)
  assert.equal(directory.competitions.value[1].registrationStats.approved, 10)
})

test('competition directory keeps records when one count request fails', async () => {
  const directory = useCompetitionDirectory({
    role: 'teacher',
    api: {
      async fetchPublicCompetitions() {
        return [{ id: 3, name: '足球赛' }]
      },
      async fetchPublicCompetitionRegistrationCount() {
        throw new Error('统计超时')
      }
    }
  })

  await directory.loadCompetitions()

  assert.equal(directory.competitions.value[0].name, '足球赛')
  assert.equal(directory.competitions.value[0].countError, '人数统计加载失败：统计超时')
  assert.equal(directory.loadError.value, '')
})
