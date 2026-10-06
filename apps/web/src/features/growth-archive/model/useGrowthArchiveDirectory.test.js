import assert from 'node:assert/strict'
import test from 'node:test'

import { useGrowthArchiveDirectory } from './useGrowthArchiveDirectory.js'

test('growth archive directory loads the active parent student timeline', async () => {
  const calls = []
  const directory = useGrowthArchiveDirectory({
    role: 'parent',
    currentStudent: {
      studentId: 18,
      name: '小山',
      schoolName: '示范幼儿园',
      className: '向日葵班'
    },
    studentsApi: {
      async fetchStudents() {
        return [{ studentId: 18, name: '小山' }]
      },
      async fetchGrowthRecords(studentId, query) {
        calls.push([studentId, query])
        return {
          items: [
            { profileEventId: 1, eventType: 'MOMENT', title: '动态' },
            { profileEventId: 2, eventType: 'COMPETITION', title: '比赛' }
          ]
        }
      }
    }
  })

  await directory.initialize()
  directory.activeType.value = '赛事'

  assert.deepEqual(calls, [[18, { pageSize: 50 }]])
  assert.equal(directory.archiveTitle.value, '小山 的成长时间线')
  assert.equal(directory.archiveSubtitle.value, '示范幼儿园 · 向日葵班')
  assert.deepEqual(directory.records.value.map(record => record.id), [2])
  assert.equal(directory.loading.value, false)
})

test('growth archive ignores a forged parent URL id and validates the active student', async () => {
  const calls = []
  const directory = useGrowthArchiveDirectory({
    role: 'parent',
    initialStudentId: 99,
    currentStudent: { studentId: 18, name: '已绑定学生' },
    studentsApi: {
      async fetchStudents() { return [{ studentId: 18, name: '已绑定学生' }] },
      async fetchGrowthRecords(studentId) {
        calls.push(studentId)
        return []
      }
    }
  })

  await directory.initialize()

  assert.deepEqual(calls, [18])
})

test('growth archive directory loads teacher students before a selected profile', async () => {
  const calls = []
  const directory = useGrowthArchiveDirectory({
    role: 'teacher',
    initialStudentId: 9,
    currentStudent: null,
    studentsApi: {
      async fetchTeacherClasses() {
        calls.push('classes')
        return [{ classId: 2 }]
      },
      async fetchStudents() {
        calls.push('students')
        return [{ id: 9, name: '小金', studentNo: 'S009', classes: [{ classId: 2 }] }]
      }
    },
    schoolApi: {
      async getOpenStudentProfile(studentId) {
        calls.push(['profile', studentId])
        return { growthRecords: [{ id: 3, eventType: 'EVALUATION' }] }
      }
    }
  })

  await directory.initialize()

  assert.deepEqual(calls.slice(0, 2).sort(), ['classes', 'students'])
  assert.deepEqual(calls[2], ['profile', '9'])
  assert.equal(directory.studentOptions.value[0].label, '小金（学号 S009）')
  assert.equal(directory.archiveTitle.value, '小金 的成长时间线')
  assert.equal(directory.records.value[0].type, '教师评价')
})

test('growth archive directory scopes school student options and waits for selection', async () => {
  const calls = []
  const directory = useGrowthArchiveDirectory({
    role: 'school',
    user: { school: { schoolId: 26 } },
    currentStudent: null,
    schoolApi: {
      async listOpenStudents(query) {
        calls.push(query)
        return { items: [{ studentId: 7, name: '小知', schoolId: 26 }] }
      }
    }
  })

  await directory.initialize()

  assert.deepEqual(calls, [{
    schoolId: 26,
    status: 'ACTIVE',
    page: 1,
    pageSize: 100
  }])
  assert.equal(directory.studentOptions.value[0].id, '7')
  assert.equal(directory.loading.value, false)
  assert.equal(directory.records.value.length, 0)
})

test('growth archive directory fails closed when the visible student list fails', async () => {
  const directory = useGrowthArchiveDirectory({
    role: 'teacher',
    initialStudentId: 5,
    currentStudent: null,
    studentsApi: {
      async fetchTeacherClasses() {
        return [{ classId: 2 }]
      },
      async fetchStudents() {
        throw new Error('学生不可用')
      }
    },
    schoolApi: {
      async getOpenStudentProfile() {
        throw new Error('档案不可用')
      }
    }
  })

  await directory.initialize()

  assert.equal(directory.studentOptionsError.value, '学生不可用')
  assert.match(directory.error.value, /无权查看/)
  assert.equal(directory.loading.value, false)
})

test('growth archive directory exposes record failures for an assigned student', async () => {
  const directory = useGrowthArchiveDirectory({
    role: 'teacher',
    initialStudentId: 5,
    currentStudent: null,
    studentsApi: {
      async fetchTeacherClasses() { return [{ classId: 2 }] },
      async fetchStudents() {
        return [{ id: 5, schoolId: 3, classes: [{ classId: 2 }] }]
      }
    },
    schoolApi: {
      async getOpenStudentProfile() { throw new Error('档案不可用') }
    }
  })

  await directory.initialize()

  assert.equal(directory.error.value, '档案不可用')
})

test('growth archive rejects a teacher URL targeting an unassigned student', async () => {
  const calls = []
  const directory = useGrowthArchiveDirectory({
    role: 'teacher',
    initialStudentId: 99,
    currentStudent: null,
    studentsApi: {
      async fetchTeacherClasses() { return [{ classId: 2 }] },
      async fetchStudents() {
        return [{ id: 9, name: '本班学生', classes: [{ classId: 2 }] }]
      }
    },
    schoolApi: {
      async getOpenStudentProfile(studentId) {
        calls.push(studentId)
        return []
      }
    }
  })

  await directory.initialize()

  assert.deepEqual(calls, [])
  assert.match(directory.error.value, /无权查看/)
  assert.deepEqual(directory.records.value, [])
})
