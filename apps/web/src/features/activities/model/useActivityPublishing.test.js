import assert from 'node:assert/strict'
import test from 'node:test'
import { reactive, ref } from 'vue'

import { useActivityPublishing } from './useActivityPublishing.js'

function createPublishingModel(role = 'teacher', overrides = {}) {
  const calls = []
  const successes = []
  const warnings = []
  const listMode = ref('visible')
  const pagination = reactive({ page: 3 })
  const studentsApi = {
    async fetchTeacherClasses() {
      calls.push(['teacher-classes'])
      return { items: [{ id: 11, name: '一班' }] }
    },
    async fetchStudents() {
      calls.push(['teacher-students'])
      return { items: [{ id: 21, name: '小明', classIds: [11], status: 'ACTIVE' }] }
    },
    ...overrides.studentsApi
  }
  const schoolApi = {
    async fetchPublicClasses(options) {
      calls.push(['school-classes', options])
      return { items: [{ id: 11, name: '一班', schoolId: 3 }] }
    },
    async listOpenStudents(options) {
      calls.push(['school-students', options])
      return { items: [{ id: 21, name: '小明', schoolId: 3, status: 'ACTIVE' }] }
    },
    async getOpenStudent(id) {
      calls.push(['student-detail', id])
      return { id, name: '小明', schoolId: 3, status: 'ACTIVE', classId: 11 }
    },
    ...overrides.schoolApi
  }
  const api = {
    async createActivity(payload) {
      calls.push(['create', payload])
      return { id: 31 }
    },
    ...overrides.api
  }
  const model = useActivityPublishing({
    role,
    currentSchoolId: ref(3),
    listMode,
    pagination,
    reloadActivities: async () => { calls.push(['reload']) },
    api,
    schoolApi,
    studentsApi,
    notify: {
      success(message) { successes.push(message) },
      error(message) { warnings.push(message) },
      warning(message) { warnings.push(message) }
    }
  })
  return { calls, listMode, model, pagination, successes, warnings }
}

test('activity publishing loads teacher classes and students', async () => {
  const { calls, model } = createPublishingModel()

  await Promise.all([model.loadPublishClasses(), model.loadPublishStudents()])

  assert.deepEqual(model.publishClassOptions.value.map(item => item.id), [11])
  assert.deepEqual(model.publishStudentOptions.value.map(item => item.id), [21])
  assert.deepEqual(calls, [['teacher-classes'], ['teacher-students']])
})

test('activity publishing keeps school options within the current school', async () => {
  const { calls, model } = createPublishingModel('school')

  await Promise.all([model.loadPublishClasses(), model.loadPublishStudents()])

  assert.deepEqual(model.publishClassOptions.value.map(item => item.id), [11])
  assert.deepEqual(model.publishStudentOptions.value.map(item => item.id), [21])
  assert.ok(calls.some(call => call[0] === 'student-detail'))
})

test('activity publishing submits strict class visibility and resets the draft', async () => {
  const { calls, listMode, model, pagination, successes } = createPublishingModel()
  model.publishForm.content = '春游记录'
  model.publishForm.classId = 11
  model.publishForm.studentIds = [21]
  model.publishMedia.value = [{ fileId: 41 }]

  await model.publishActivity()

  assert.deepEqual(calls[0], [
    'create',
    {
      content: '春游记录',
      visibility: 'CLASS',
      classId: 11,
      studentIds: [21],
      mediaFileIds: [41]
    }
  ])
  assert.equal(model.publishForm.content, '')
  assert.deepEqual(model.publishForm.studentIds, [])
  assert.deepEqual(model.publishMedia.value, [])
  assert.equal(listMode.value, 'mine')
  assert.equal(pagination.page, 1)
  assert.deepEqual(successes, ['动态已发布'])
})
