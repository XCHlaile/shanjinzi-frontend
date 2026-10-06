import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useSchoolClassManagement } from './useSchoolClassManagement.js'

test('school class facade wires the school directory to class membership', async () => {
  const calls = []
  const schoolId = ref(null)
  let relatedLoader
  const notify = { success() {} }
  const confirm = async () => {}
  const directory = {
    initialize: async () => true,
    schoolId,
    setRelatedLoader(loader) {
      calls.push('related-loader')
      relatedLoader = loader
    }
  }
  const membership = {
    loadTeacherOptions: async () => calls.push('teachers'),
    teacherOptions: ref([])
  }

  const facade = useSchoolClassManagement({
    confirm,
    notify,
    createDirectory(options) {
      calls.push('directory')
      assert.equal(options.notify, notify)
      return directory
    },
    createMembership(options) {
      calls.push('membership')
      assert.equal(options.schoolId, schoolId)
      assert.equal(options.confirm, confirm)
      assert.equal(options.notify, notify)
      return membership
    }
  })

  assert.deepEqual(calls, ['directory', 'membership', 'related-loader'])
  assert.equal(facade.schoolId, schoolId)
  assert.equal(facade.teacherOptions, membership.teacherOptions)

  await relatedLoader()
  assert.deepEqual(calls.slice(-1), ['teachers'])
})
