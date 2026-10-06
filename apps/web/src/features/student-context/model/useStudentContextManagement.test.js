import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useStudentContextManagement } from './useStudentContextManagement.js'

test('student context facade refreshes bindings through the shared directory', async () => {
  const calls = []
  const confirm = async () => {}
  const notify = { success() {}, error() {}, warning() {} }
  const directory = {
    loadStudents: async () => calls.push('students'),
    students: ref([])
  }
  const binding = {
    loadSchools: async () => calls.push('schools'),
    schoolOptions: ref([])
  }

  const facade = useStudentContextManagement({
    confirm,
    notify,
    createDirectory() {
      calls.push('directory')
      return directory
    },
    createBinding(options) {
      calls.push('binding')
      assert.equal(options.reloadStudents, directory.loadStudents)
      assert.equal(options.confirm, confirm)
      assert.equal(options.notify, notify)
      return binding
    }
  })

  assert.deepEqual(calls, ['directory', 'binding'])
  assert.equal(facade.students, directory.students)
  assert.equal(facade.schoolOptions, binding.schoolOptions)

  await facade.initialize()
  assert.deepEqual(calls.slice(-2).sort(), ['schools', 'students'])
})
