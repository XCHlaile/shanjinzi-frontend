import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useRosterStudentProfile } from './useRosterStudentProfile.js'

test('roster student profile opens and loads normalized page items', async () => {
  const activeStudent = ref(null)
  const calls = []
  const profile = useRosterStudentProfile({
    activeStudent,
    api: {
      async getOpenStudentProfile(studentId) {
        calls.push(studentId)
        return { records: [{ id: 7, title: '入园' }] }
      }
    }
  })
  const student = { id: 3, name: '小山' }

  assert.equal(await profile.openProfile(student), true)
  assert.deepEqual(calls, [3])
  assert.deepEqual(activeStudent.value, student)
  assert.equal(profile.profileDialog.value, true)
  assert.deepEqual(profile.profileEvents.value, [{
    id: 7,
    title: '入园'
  }])
  assert.equal(profile.drawerLoading.value, false)
})

test('roster student profile clears stale events after a load failure', async () => {
  const profile = useRosterStudentProfile({
    activeStudent: ref(null),
    api: {
      async getOpenStudentProfile() {
        throw new Error('档案服务不可用')
      }
    }
  })
  profile.profileEvents.value = [{ id: 1 }]

  assert.equal(await profile.openProfile({ id: 4 }), false)
  assert.deepEqual(profile.profileEvents.value, [])
  assert.equal(profile.drawerError.value, '档案服务不可用')
  assert.equal(profile.drawerLoading.value, false)
})
