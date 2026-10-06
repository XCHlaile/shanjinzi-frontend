import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { buildStudentUpdatePayload, createAdminApiClient, fillAdminPath, normalizeStudentImportFile } from './adminApi.js'
import { adminApiContracts } from './adminContracts.js'

const openapi5 = JSON.parse(readFileSync(new URL('../../../../../docs/api/5openapi.json', import.meta.url), 'utf8'))
const openapi6 = JSON.parse(readFileSync(new URL('../../../../../docs/api/6openapi.json', import.meta.url), 'utf8'))
const openapi7 = JSON.parse(readFileSync(new URL('../../../../../docs/api/7openapi.json', import.meta.url), 'utf8'))
const openapi8 = JSON.parse(readFileSync(new URL('../../../../../docs/api/8openapi.json', import.meta.url), 'utf8'))
const openapi9 = JSON.parse(readFileSync(new URL('../../../../../docs/api/9openapi.json', import.meta.url), 'utf8'))
const openapi12 = JSON.parse(readFileSync(new URL('../../../../../docs/api/12openapi.json', import.meta.url), 'utf8'))

function collectContracts(group) {
  return Object.values(group).flatMap(value => {
    if (value?.method && value?.path) return [value]
    return value && typeof value === 'object' ? collectContracts(value) : []
  })
}

function operationSet(doc) {
  return new Set(Object.entries(doc.paths).flatMap(([path, item]) =>
    Object.keys(item)
      .filter(method => ['get', 'post', 'put', 'patch', 'delete'].includes(method))
      .map(method => `${method.toUpperCase()} ${path}`)
  ))
}

function addedAdminAndOpenOperations(previous, current) {
  const oldOperations = operationSet(previous)
  return [...operationSet(current)]
    .filter(operation => !oldOperations.has(operation))
    .filter(operation => operation.includes(' /api/admin/') || operation.includes(' /api/open/'))
    .sort()
}

function declaredOperationsFor(operations) {
  return collectContracts(adminApiContracts)
    .map(contract => `${contract.method} ${contract.path}`)
    .filter(operation => operations.includes(operation))
    .sort()
}

test('requires the multipart file mandated by the public student import contract', () => {
  assert.throws(() => normalizeStudentImportFile(null), /学生导入文件不能为空/)
})

function operationsSupportedByLatest(operations) {
  const latestOperations = operationSet(openapi12)
  return operations.filter(operation => latestOperations.has(operation))
}

test('declares every admin and open endpoint introduced by 6openapi.json', () => {
  const addedOperations = addedAdminAndOpenOperations(openapi5, openapi6)
  assert.equal(addedOperations.length, 27)
  const supportedOperations = operationsSupportedByLatest(addedOperations)
  assert.deepEqual(declaredOperationsFor(supportedOperations), supportedOperations)
})

test('declares every admin and open endpoint introduced by 7openapi.json', () => {
  const addedOperations = addedAdminAndOpenOperations(openapi6, openapi7)
  assert.deepEqual(addedOperations, [
    'GET /api/admin/content-reports',
    'GET /api/admin/content-reports/{reportId}',
    'GET /api/open/competitions/registrations',
    'GET /api/open/students/import/template',
    'PATCH /api/admin/content-reports/{reportId}/handle',
    'PATCH /api/open/competitions/{id}/lead-teacher',
    'POST /api/open/students/import'
  ])
  const supportedOperations = operationsSupportedByLatest(addedOperations)
  assert.deepEqual(declaredOperationsFor(supportedOperations), supportedOperations)
})

test('migrates every 12openapi student operation to the public namespace', () => {
  const publicStudentOperations = [...operationSet(openapi12)]
    .filter(operation => operation.includes(' /api/public/students'))
    .sort()
  assert.equal(publicStudentOperations.length, 14)
  assert.deepEqual(declaredOperationsFor(publicStudentOperations), publicStudentOperations)
  assert.ok(!collectContracts(adminApiContracts).some(contract => contract.path.startsWith('/api/open/students')))
  assert.deepEqual(openapi12.components.schemas.PublicStudentSetClassRequest.required, ['classId'])
})

test('tracks admin and open endpoint changes from 8openapi.json', () => {
  const addedOperations = addedAdminAndOpenOperations(openapi7, openapi8)
  assert.deepEqual(addedOperations, [])
  const operation = openapi8.paths['/api/admin/competitions/{id}/registrations'].get
  assert.deepEqual(operation.parameters.slice(1).map(parameter => parameter.name), [
    'page', 'pageSize', 'status', 'keyword'
  ])
})

test('declares every class management endpoint introduced by 9openapi.json', () => {
  const oldOperations = operationSet(openapi8)
  const addedClassOperations = [...operationSet(openapi9)]
    .filter(operation => !oldOperations.has(operation) && operation.includes(' /api/public/classes'))
    .sort()
  assert.deepEqual(addedClassOperations, [
    'DELETE /api/public/classes/{id}',
    'GET /api/public/classes',
    'GET /api/public/classes/{id}',
    'PATCH /api/public/classes/{id}',
    'PATCH /api/public/classes/{id}/disable',
    'PATCH /api/public/classes/{id}/enable',
    'POST /api/public/classes',
    'POST /api/public/classes/{id}/teachers'
  ])
  assert.deepEqual(declaredOperationsFor(addedClassOperations), addedClassOperations)
})

test('fills encoded admin path parameters', () => {
  assert.equal(fillAdminPath('/api/public/students/{id}/guardians/{guardianUserId}/unbind', {
    id: 7,
    guardianUserId: '8/9'
  }), '/api/public/students/7/guardians/8%2F9/unbind')
})

test('builds a partial student update containing only changed fields', () => {
  const original = {
    name: '学生甲',
    gender: 'MALE',
    birthday: '2018-02-03',
    studentNo: 'S001',
    classId: 4,
    enrollmentStatus: 'ENROLLED'
  }

  assert.deepEqual(buildStudentUpdatePayload({ ...original, name: '学生乙' }, original), {
    name: '学生乙'
  })
  assert.deepEqual(buildStudentUpdatePayload({ ...original, classId: 8 }, original), {})
  assert.deepEqual(buildStudentUpdatePayload({ ...original }, original), {})
})

test('maps current admin and open requests without legacy query fields', async () => {
  const calls = []
  const downloads = []
  const api = createAdminApiClient({
    request(path, options = {}) {
      calls.push({ method: options.method || 'GET', path, options })
      return Promise.resolve({ ok: true })
    },
    download(path, options = {}) {
      downloads.push({ method: options.method || 'GET', path, options })
      return Promise.resolve({ blob: new Blob(['file']) })
    }
  })

  await api.listSchools({ name: '一中', status: 'ACTIVE' })
  await api.getSchool(1)
  await api.listClasses({ schoolId: '2', name: '一班', gradeName: '大班', status: 'ACTIVE', page: 3, pageSize: 50 })
  await api.getClass(7)
  await api.createClass({ schoolId: '2', name: '一班', gradeName: '大班', sortOrder: '10', status: 'IGNORED' })
  await api.updateClass(7, { schoolId: 99, name: '二班', gradeName: '中班', sortOrder: '20', status: 'IGNORED' })
  await api.disableClass(7)
  await api.enableClass(7)
  await api.assignClassTeachers(7, ['3', 4, '3', 'invalid'])
  await api.deleteClass(7)
  await api.listCompetitionRegistrations(2, {
    page: 3, pageSize: 50, status: 'REGISTERED', keyword: '张同学', ignored: true
  })
  await api.listContentReports({ schoolId: '3', status: 'PENDING', targetType: 'MOMENT', page: 2, pageSize: 50 })
  await api.getContentReport(4)
  await api.handleContentReport(4, { action: 'CUSTOM_ACTION', note: '已核查', ignored: true })

  await api.listOpenUsers({ roleCode: 'TEACHER', schoolId: '1', classId: '6' })
  await api.createOpenUser({ phone: '13900000000', realName: '教师', roleCode: 'TEACHER', schoolId: '1' })
  await api.getOpenUser(3)
  await api.updateOpenUser(3, { realName: '新姓名', avatarFileId: '9', ignored: true })
  await api.updateOpenUserClasses(3, ['4', 5])
  await api.bindOpenUserStudents(3, ['6', 7, '6'], 'MOTHER')
  await api.enableOpenUser(3)
  await api.disableOpenUser(3)

  await api.listOpenStudents({ name: '学生', classId: 4 })
  await api.createOpenStudent({
    schoolId: '1', name: '学生', classId: '4', phoneNum: '13800138000', bindCode: 'MUST-OMIT'
  })
  await api.getOpenStudent(6)
  await api.updateOpenStudent(6, {
    name: '学生乙', classId: '5', enrollmentStatus: 'ENROLLED', bindCode: 'PATCH-MUST-OMIT'
  })
  await api.setOpenStudentClass(6, '5')
  await api.enableOpenStudent(6)
  await api.disableOpenStudent(6)
  await api.listOpenStudentGuardians(6)
  await api.unbindOpenStudentGuardian(6, 7)
  await api.getOpenStudentProfile(6)
  await api.listOpenStudentImportBatches({ pageSize: 50 })
  await api.getOpenStudentImportBatch(8)
  const importFile = new Blob(['students'], { type: 'text/csv' })
  Object.defineProperty(importFile, 'name', { value: 'students.csv' })
  await api.importOpenStudents(importFile, {
    schoolId: '9', autoCreateClass: false, remark: '秋季导入'
  })
  await api.downloadOpenStudentImportTemplate()

  await api.listOpenCompetitionRegistrations(9, {
    classId: '10', startTime: '2026-07-01T00:00:00', endTime: '2026-07-31T23:59:59'
  })
  await api.listOpenCompetitionRegistrations(10)
  await api.listParentCompetitionRegistrations('11')
  await api.setOpenCompetitionLeadTeacher(9, '12')
  await api.listOpenAuditLogs({ module: 'USER', riskLevel: 'HIGH' })
  await api.getOpenAuditLog(13)
  await api.listOpenExportTasks({ page: 2 })
  await api.createOpenExportTask({ taskType: 'STUDENTS', scopeType: 'SCHOOL', filterJson: { classId: 4 } })
  await api.getOpenExportTask(14)
  await api.downloadOpenExportTask(14)

  assert.deepEqual(calls.map(call => `${call.method} ${call.path}`), [
    'GET /api/admin/schools',
    'GET /api/admin/schools/1',
    'GET /api/public/classes',
    'GET /api/public/classes/7',
    'POST /api/public/classes',
    'PATCH /api/public/classes/7',
    'PATCH /api/public/classes/7/disable',
    'PATCH /api/public/classes/7/enable',
    'POST /api/public/classes/7/teachers',
    'DELETE /api/public/classes/7',
    'GET /api/admin/competitions/2/registrations',
    'GET /api/admin/content-reports',
    'GET /api/admin/content-reports/4',
    'PATCH /api/admin/content-reports/4/handle',
    'GET /api/open/users',
    'POST /api/open/users',
    'GET /api/open/users/3',
    'PATCH /api/open/users/3',
    'PATCH /api/open/users/3/classes',
    'POST /api/open/users/3/bind-students',
    'PATCH /api/open/users/3/enable',
    'PATCH /api/open/users/3/disable',
    'GET /api/public/students',
    'POST /api/public/students',
    'GET /api/public/students/6',
    'PATCH /api/public/students/6',
    'PATCH /api/public/students/6/class',
    'PATCH /api/public/students/6/enable',
    'PATCH /api/public/students/6/disable',
    'GET /api/public/students/6/guardians',
    'POST /api/public/students/6/guardians/7/unbind',
    'GET /api/public/students/6/profile',
    'GET /api/public/students/import/batches',
    'GET /api/public/students/import/batches/8',
    'POST /api/public/students/import',
    'GET /api/open/competitions/9/registrations',
    'GET /api/open/competitions/10/registrations',
    'GET /api/open/competitions/registrations',
    'PATCH /api/open/competitions/9/lead-teacher',
    'GET /api/open/audit-logs',
    'GET /api/open/audit-logs/13',
    'GET /api/open/export-tasks',
    'POST /api/open/export-tasks',
    'GET /api/open/export-tasks/14'
  ])
  assert.deepEqual(downloads.map(call => `${call.method} ${call.path}`), [
    'GET /api/public/students/import/template',
    'GET /api/open/export-tasks/14/download'
  ])

  const call = (path, method) => calls.find(item => item.path === path && (!method || item.method === method))
  assert.deepEqual(call('/api/public/classes').options.query, {
    schoolId: 2, name: '一班', gradeName: '大班', status: 'ACTIVE', page: 3, pageSize: 50
  })
  assert.deepEqual(call('/api/public/classes', 'POST').options.body, {
    name: '一班', gradeName: '大班', sortOrder: 10, schoolId: 2
  })
  assert.deepEqual(call('/api/public/classes/7', 'PATCH').options.body, {
    name: '二班', gradeName: '中班', sortOrder: 20
  })
  assert.deepEqual(call('/api/public/classes/7/teachers', 'POST').options.body, { teacherIds: [3, 4] })
  assert.deepEqual(call('/api/open/users/3/bind-students', 'POST').options.body, {
    studentIds: [6, 7], relationType: 'MOTHER'
  })
  assert.deepEqual(call('/api/admin/competitions/2/registrations').options.query, {
    page: 3, pageSize: 50, status: 'REGISTERED', keyword: '张同学'
  })
  assert.deepEqual(call('/api/admin/content-reports').options.query, {
    schoolId: 3, status: 'PENDING', targetType: 'MOMENT', page: 2, pageSize: 50
  })
  assert.deepEqual(call('/api/admin/content-reports/4/handle').options.body, {
    action: 'CUSTOM_ACTION', note: '已核查'
  })
  assert.deepEqual(call('/api/open/users').options.query, {
    roleCode: 'TEACHER', schoolId: 1, classId: 6, page: 1, pageSize: 20
  })
  assert.deepEqual(call('/api/public/students', 'POST').options.body, {
    schoolId: 1, name: '学生', classId: 4, phoneNumber: '13800138000'
  })
  assert.deepEqual(call('/api/public/students/6', 'PATCH').options.body, {
    name: '学生乙', enrollmentStatus: 'ENROLLED'
  })
  assert.deepEqual(call('/api/public/students/6/class', 'PATCH').options.body, { classId: 5 })

  const importCall = call('/api/public/students/import', 'POST')
  assert.deepEqual(importCall.options.query, {
    schoolId: 9, autoCreateClass: false, remark: '秋季导入'
  })
  assert.ok(importCall.options.body instanceof FormData)
  assert.deepEqual([...importCall.options.body.keys()], ['file'])
  assert.equal(importCall.options.body.get('file').name, 'students.csv')
  assert.equal(importCall.options.body.get('file').type, 'text/csv')

  assert.deepEqual(call('/api/open/competitions/9/registrations').options.query, {
    classId: 10,
    startTime: '2026-07-01T00:00:00',
    endTime: '2026-07-31T23:59:59'
  })
  assert.deepEqual(call('/api/open/competitions/10/registrations').options, {})
  assert.deepEqual(call('/api/open/competitions/registrations').options.query, { parentId: 11 })
  assert.deepEqual(call('/api/open/competitions/9/lead-teacher').options.body, { key: 12 })
  assert.deepEqual(call('/api/open/export-tasks', 'POST').options.body, {
    taskType: 'STUDENTS', scopeType: 'SCHOOL', filterJson: '{"classId":4}'
  })
})
