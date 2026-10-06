import assert from 'node:assert/strict'
import test from 'node:test'

import {
  acceptsStudentImportFile,
  classOptionLabel,
  emptyStudentFilters,
  isFullPhone,
  normalizeStudentListRow,
  parentOptionLabel,
  studentCreatePayload,
  studentFilterPayload,
  studentFormValues
} from './studentManagementViewModel.js'

test('student view model owns filters and create payload normalization', () => {
  assert.deepEqual(emptyStudentFilters(), {
    name: '',
    studentNo: '',
    classId: null,
    enrollmentStatus: '',
    status: ''
  })
  assert.deepEqual(studentFilterPayload({
    name: ' 小山 ',
    studentNo: '',
    classId: 3,
    enrollmentStatus: '',
    status: 'ACTIVE'
  }), {
    name: '小山',
    studentNo: undefined,
    classId: 3,
    enrollmentStatus: undefined,
    status: 'ACTIVE'
  })
  assert.deepEqual(studentCreatePayload({
    schoolId: 2,
    name: ' 小山 ',
    gender: '',
    birthday: '',
    studentNo: ' S001 ',
    classId: null,
    phoneNum: '13900000000'
  }), {
    schoolId: 2,
    name: '小山',
    gender: undefined,
    birthday: undefined,
    studentNo: 'S001',
    classId: undefined,
    phoneNum: '13900000000'
  })
})

test('student view model normalizes detail data and primary class', () => {
  const detail = {
    id: 7,
    name: '小山',
    phoneNumber: '13900000000',
    classes: [{ classId: 3, className: '大一班', isPrimary: true }]
  }
  assert.equal(studentFormValues(detail).classId, 3)
  assert.deepEqual(normalizeStudentListRow(
    { id: 7, name: '小山' },
    detail,
    2
  ), {
    id: 7,
    name: '小山',
    classId: 3,
    className: '大一班',
    phoneNum: '13900000000',
    guardianCount: 2
  })
})

test('student view model centralizes labels and input validation', () => {
  assert.equal(isFullPhone('13900000000'), true)
  assert.equal(isFullPhone('1390000000'), false)
  assert.equal(classOptionLabel({
    id: 3,
    name: '大一班',
    gradeName: '大班',
    status: 'DISABLED'
  }), '大班 · 大一班（已停用）')
  assert.equal(parentOptionLabel({
    id: 8,
    realName: '山妈妈',
    phone: '13800000000'
  }), '山妈妈 · 13800000000')
  assert.equal(acceptsStudentImportFile({ name: 'students.xlsx' }), true)
  assert.equal(acceptsStudentImportFile({ name: 'students.pdf' }), false)
})
