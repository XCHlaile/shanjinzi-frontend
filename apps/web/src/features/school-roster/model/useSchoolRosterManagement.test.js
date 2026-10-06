import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useSchoolRosterManagement } from './useSchoolRosterManagement.js'

test('school roster facade composes models after the active student exists', async () => {
  const calls = []
  const mode = ref('teachers')
  const activeStudent = ref(null)
  let modeChanged
  let profileActiveStudent
  const directory = {
    classIdFilter: ref('7'),
    keyword: ref('小山'),
    loadRows: async () => calls.push('loadRows'),
    page: ref(3),
    resolveSchoolId: async () => 2,
    rows: ref([]),
    statusFilter: ref('ACTIVE')
  }
  const recordManagement = {
    loadClassOptions: async () => calls.push('loadClassOptions')
  }

  const facade = useSchoolRosterManagement({
    mode,
    createDirectory() {
      calls.push('directory')
      return directory
    },
    createRecordManagement(options) {
      calls.push('record')
      assert.equal(options.reloadRows, directory.loadRows)
      return recordManagement
    },
    createGuardianManagement(options) {
      calls.push('guardian')
      assert.equal(options.rows, directory.rows)
      return { activeStudent }
    },
    createStudentProfile(options) {
      calls.push('profile')
      profileActiveStudent = options.activeStudent
      return {}
    },
    createRosterTransfers(options) {
      calls.push('transfers')
      assert.equal(options.keyword, directory.keyword)
      return {}
    },
    watchMode(_mode, callback, options) {
      assert.deepEqual(options, { immediate: true })
      modeChanged = callback
    }
  })

  assert.deepEqual(calls, ['directory', 'record', 'guardian', 'profile', 'transfers'])
  assert.equal(profileActiveStudent, activeStudent)
  assert.equal(facade.activeStudent, activeStudent)
  assert.equal(facade.title.value, '本校教师管理')

  await modeChanged()
  assert.equal(directory.keyword.value, '')
  assert.equal(directory.statusFilter.value, '')
  assert.equal(directory.classIdFilter.value, '')
  assert.equal(directory.page.value, 1)
  assert.deepEqual(calls.slice(-2), ['loadClassOptions', 'loadRows'])
})

test('school roster facade skips class loading outside teacher mode', async () => {
  const calls = []
  const mode = ref('students')
  let modeChanged
  const directory = {
    classIdFilter: ref(''),
    keyword: ref(''),
    loadRows: async () => calls.push('loadRows'),
    page: ref(1),
    resolveSchoolId: async () => 2,
    rows: ref([]),
    statusFilter: ref('')
  }

  const facade = useSchoolRosterManagement({
    mode,
    createDirectory: () => directory,
    createRecordManagement: () => ({
      loadClassOptions: async () => calls.push('loadClassOptions')
    }),
    createGuardianManagement: () => ({ activeStudent: ref(null) }),
    createStudentProfile: () => ({}),
    createRosterTransfers: () => ({}),
    watchMode(_mode, callback) {
      modeChanged = callback
    }
  })

  await modeChanged()
  assert.deepEqual(calls, ['loadRows'])
  assert.equal(facade.modeLabel.value, '学生')
  assert.equal(facade.roleCode.value, 'PARENT')
})
