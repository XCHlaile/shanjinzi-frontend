import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useClassMembership } from './useClassMembership.js'

function createMembershipModel(apiOverrides = {}) {
  const calls = []
  const successes = []
  let assignedClassId = 10
  const api = {
    async listOpenUsers(options) {
      calls.push(['list-teachers', options])
      return { items: [{ id: 7, realName: '林老师', schoolId: 3, classes: [{ classId: 11 }] }] }
    },
    async getOpenUser(id) {
      calls.push(['get-teacher', id])
      return { id, schoolId: 3, classes: [{ classId: 11 }] }
    },
    async listOpenStudents(options) {
      calls.push(['list-students', options])
      return { items: [{ id: 21, name: '小明', schoolId: 3, classId: 10 }] }
    },
    async fetchPublicClasses(options) {
      calls.push(['list-classes', options])
      return {
        items: [
          { id: 10, name: '一班', schoolId: 3, status: 'ACTIVE' },
          { id: 11, name: '二班', schoolId: 3, status: 'ACTIVE' }
        ]
      }
    },
    async getOpenStudent(id) {
      calls.push(['get-student', id])
      return { id, name: '小明', schoolId: 3, classId: assignedClassId }
    },
    async setOpenStudentClass(studentId, classId) {
      calls.push(['move-student', studentId, classId])
      assignedClassId = classId
    },
    async removeOpenStudentClass(studentId) {
      calls.push(['remove-student', studentId])
      assignedClassId = null
    },
    async assignPublicClassTeachers(classId, teacherIds) {
      calls.push(['assign-teachers', classId, teacherIds])
    },
    ...apiOverrides
  }
  const model = useClassMembership({
    schoolId: ref(3),
    api,
    confirm: async (...args) => { calls.push(['confirm', ...args]) },
    notify: { success(message) { successes.push(message) } }
  })
  return { calls, model, successes }
}

test('class membership loads school teachers and selects current assignments', async () => {
  const { calls, model } = createMembershipModel()

  await model.openTeacherAssignment({ id: 11, name: '二班', schoolId: 3 })

  assert.equal(model.teacherDialogVisible.value, true)
  assert.deepEqual(model.selectedTeacherIds.value, [7])
  assert.equal(model.teachersForClass(11).length, 1)
  assert.deepEqual(calls.slice(0, 2), [
    ['list-teachers', { roleCode: 'TEACHER', schoolId: 3, page: 1, pageSize: 100 }],
    ['get-teacher', 7]
  ])
})

test('class membership loads school students and verifies class moves', async () => {
  const { calls, model, successes } = createMembershipModel()
  const targetClass = { id: 11, name: '二班', schoolId: 3 }

  await model.openStudentAssignment(targetClass)
  model.selectedStudentId.value = 21
  await model.addSelectedStudent()

  assert.equal(model.studentDialogVisible.value, true)
  assert.equal(model.currentClassStudentCount.value, 1)
  assert.equal(model.availableStudents.value.length, 0)
  assert.deepEqual(calls.filter(call => ['move-student', 'get-student'].includes(call[0])), [
    ['get-student', 21],
    ['move-student', 21, 11],
    ['get-student', 21]
  ])
  assert.deepEqual(successes, ['小明已调整到二班'])
})

test('class membership saves teachers only after backend verification', async () => {
  const { calls, model, successes } = createMembershipModel()
  await model.openTeacherAssignment({ id: 11, schoolId: 3 })
  model.selectedTeacherIds.value = [7]

  await model.saveTeachers()

  assert.deepEqual(calls.find(call => call[0] === 'assign-teachers'), ['assign-teachers', 11, [7]])
  assert.equal(model.teacherDialogVisible.value, false)
  assert.deepEqual(successes, ['班级教师分配已保存'])
})

test('class membership removes a student from the active class and verifies the result', async () => {
  const { calls, model, successes } = createMembershipModel()

  await model.openStudentAssignment({ id: 10, name: '一班', schoolId: 3 })
  await model.removeStudentFromClass(model.currentClassStudents.value[0])

  assert.deepEqual(calls.filter(call => ['remove-student', 'get-student'].includes(call[0])), [
    ['get-student', 21],
    ['remove-student', 21],
    ['get-student', 21]
  ])
  assert.equal(model.currentClassStudentCount.value, 0)
  assert.deepEqual(successes, ['小明已移出一班'])
})
