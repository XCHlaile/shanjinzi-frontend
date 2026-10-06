import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createGuardianBindingForm,
  createStudentForm,
  createUserForm,
  isFullPhone,
  normalizeStudentRosterRow,
  parentOptionLabel,
  parentSearchQuery,
  sortSchoolClassOptions,
  studentSearchFields
} from '../index.js'

test('roster model creates editable student and user forms', () => {
  assert.deepEqual(createStudentForm({
    name: '小树',
    studentNo: 'S007',
    gender: 'MALE',
    classes: [{ classId: 3, isPrimary: true }],
    enrollmentStatus: 'ENROLLED'
  }), {
    name: '小树',
    studentNo: 'S007',
    gender: 'MALE',
    birthday: '',
    classId: 3,
    phoneNum: '',
    enrollmentStatus: 'ENROLLED'
  })
  assert.deepEqual(createUserForm({
    realName: '林老师',
    phone: '13800000000',
    classes: [{ classId: 2 }, { id: 3 }]
  }), {
    realName: '林老师',
    phone: '13800000000',
    nickname: '',
    gender: '',
    classIds: [2, 3]
  })
  assert.deepEqual(createGuardianBindingForm(), { parentId: null, relationType: '' })
})

test('roster model normalizes student rows and school class options', () => {
  const row = normalizeStudentRosterRow(
    { id: 7, guardiansCount: 1 },
    {
      studentNo: 'S007',
      classes: [{ classId: 3, className: '三班', isPrimary: true }]
    }
  )
  const classes = sortSchoolClassOptions([
    { id: 2, schoolId: 8, sortOrder: 20 },
    { id: 1, schoolId: 8, sortOrder: 10 },
    { id: 3, schoolId: 9, sortOrder: 1 }
  ], 8)

  assert.equal(row.studentNo, 'S007')
  assert.equal(row.classId, 3)
  assert.equal(row.guardianCount, 1)
  assert.deepEqual(classes.map(item => item.id), [1, 2])
})

test('roster model owns search and parent contact rules', () => {
  assert.deepEqual(studentSearchFields('S007'), ['studentNo', 'name'])
  assert.deepEqual(studentSearchFields('小树'), ['name', 'studentNo'])
  assert.deepEqual(parentSearchQuery('13800000000'), { phone: '13800000000' })
  assert.deepEqual(parentSearchQuery(' 林老师 '), { realName: '林老师' })
  assert.equal(parentOptionLabel({ id: 3, realName: '王家长', phone: '13900000000' }), '王家长 · 13900000000')
  assert.equal(isFullPhone('13800000000'), true)
  assert.equal(isFullPhone('138****0000'), false)
})
