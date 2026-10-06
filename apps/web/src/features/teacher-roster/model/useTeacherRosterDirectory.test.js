import assert from 'node:assert/strict'
import test from 'node:test'

import { useTeacherRosterDirectory } from './useTeacherRosterDirectory.js'

test('teacher roster directory loads classes and students in parallel', async () => {
  const calls = []
  const directory = useTeacherRosterDirectory({
    api: {
      async fetchTeacherClasses() {
        calls.push('classes')
        return {
          classes: [
            { classId: 2, className: '向日葵班', studentCount: 3 },
            { classId: 3, className: '星星班', studentCount: 2 }
          ]
        }
      },
      async fetchStudents() {
        calls.push('students')
        return {
          students: [{
            studentId: 8,
            name: '小山',
            studentNo: 'S008',
            classes: [{ classId: 2, className: '向日葵班' }]
          }]
        }
      }
    }
  })

  await directory.loadRoster()

  assert.deepEqual(calls.sort(), ['classes', 'students'])
  assert.equal(directory.teacherClasses.value.length, 2)
  assert.equal(directory.students.value[0].code, 'S008')
  assert.equal(directory.totalStudentCount.value, 5)
  assert.equal(directory.loading.value, false)
})

test('teacher roster directory combines class selection and keyword search', async () => {
  const directory = useTeacherRosterDirectory({
    api: {
      async fetchTeacherClasses() {
        return [{ id: 2, name: '向日葵班', studentCount: 1 }]
      },
      async fetchStudents() {
        return [
          { id: 8, name: '小山', studentNo: 'S008', classes: [{ classId: 2 }] },
          { id: 9, name: '小金', studentNo: 'S009', classes: [{ classId: 3 }] }
        ]
      }
    }
  })
  await directory.loadRoster()

  directory.activeClassId.value = 2
  directory.keyword.value = 'S008'

  assert.deepEqual(directory.filteredStudents.value.map(student => student.id), [8])
  assert.equal(directory.emptyStudentMessage.value, '向日葵班暂无学生')
})

test('teacher roster directory clears stale data and invalid selection', async () => {
  let shouldFail = false
  const directory = useTeacherRosterDirectory({
    api: {
      async fetchTeacherClasses() {
        if (shouldFail) throw new Error('名册不可用')
        return [{ id: 2, name: '向日葵班' }]
      },
      async fetchStudents() {
        return [{ id: 8, name: '小山' }]
      }
    }
  })
  directory.activeClassId.value = 9

  await directory.loadRoster()
  assert.equal(directory.activeClassId.value, '')

  shouldFail = true
  await directory.loadRoster()

  assert.deepEqual(directory.teacherClasses.value, [])
  assert.deepEqual(directory.students.value, [])
  assert.equal(directory.loadError.value, '名册不可用')
})

test('teacher roster directory fails closed when the teacher has no assigned classes', async () => {
  const directory = useTeacherRosterDirectory({
    api: {
      async fetchTeacherClasses() { return [] },
      async fetchStudents() {
        return [{ id: 8, name: '不应显示的学生', classes: [{ classId: 2 }] }]
      }
    }
  })

  await directory.loadRoster()

  assert.deepEqual(directory.students.value, [])
})
