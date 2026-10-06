import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useActivityManagement } from './useActivityManagement.js'

test('activity facade wires directory reset, related loaders and mutations', async () => {
  const calls = []
  let resetActiveMoment
  let loadRelated
  const directory = {
    activityList: ref([]),
    currentSchoolId: ref(2),
    listMode: ref('school'),
    loadActivities: async () => {},
    pagination: ref({ page: 1 }),
    setActiveMomentReset(callback) {
      resetActiveMoment = callback
    },
    setRelatedLoader(callback) {
      loadRelated = callback
    }
  }
  const comments = { activeMomentId: ref(7) }
  const publishing = {
    loadPublishClasses: async () => calls.push('classes'),
    loadPublishStudents: async () => calls.push('students')
  }
  const mutations = { likingMomentId: ref(null) }

  const facade = useActivityManagement({
    role: 'school',
    currentStudent: null,
    initialUser: { id: 8 },
    requestedMomentId: () => undefined,
    currentUserId: '8',
    createDirectory() {
      calls.push('directory')
      return directory
    },
    createComments(options) {
      calls.push('comments')
      assert.equal(options.currentUserId, '8')
      return comments
    },
    createPublishing(options) {
      calls.push('publishing')
      assert.equal(options.currentSchoolId, directory.currentSchoolId)
      assert.equal(options.reloadActivities, directory.loadActivities)
      return publishing
    },
    createMutations(options) {
      calls.push('mutations')
      assert.equal(options.activityList, directory.activityList)
      return mutations
    }
  })

  assert.deepEqual(calls, ['directory', 'comments', 'publishing', 'mutations'])
  resetActiveMoment()
  assert.equal(comments.activeMomentId.value, null)
  await loadRelated()
  assert.deepEqual(calls.slice(-2), ['classes', 'students'])
  assert.equal(facade.likingMomentId, mutations.likingMomentId)
})
