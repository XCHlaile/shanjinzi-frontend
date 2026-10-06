import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ACTIVE_STUDENT_BINDING_STATUSES,
  DEFAULT_STUDENT_RELATION_TYPE,
  STUDENT_RELATION_OPTIONS,
  guardianBindingToStudent,
  isActiveStudentBinding,
  mergeBoundStudents,
  normalizeContextStudent,
  studentAgeFromBirthday,
  studentBindStatusLabel,
  studentContextList,
  studentRelationLabel
} from '../index.js'

test('student context view model normalizes students and ages', () => {
  assert.equal(
    studentAgeFromBirthday('2020-08-01', new Date('2026-07-31T12:00:00')),
    5
  )
  assert.equal(studentAgeFromBirthday('invalid'), '-')
  assert.deepEqual(
    normalizeContextStudent(
      {
        studentId: 8,
        studentName: '小山',
        birthday: '2020-08-01',
        classes: [{ className: '一班', primary: true }]
      },
      new Date('2026-07-31T12:00:00')
    ),
    {
      studentId: 8,
      studentName: '小山',
      birthday: '2020-08-01',
      classes: [{ className: '一班', primary: true }],
      id: 8,
      name: '小山',
      schoolName: '-',
      className: '一班',
      age: 5,
      studentNo: '-',
      relationType: '',
      bindStatus: ''
    }
  )
})

test('student context view model centralizes relations and statuses', () => {
  assert.equal(DEFAULT_STUDENT_RELATION_TYPE, 'MOTHER')
  assert.equal(STUDENT_RELATION_OPTIONS.length, 6)
  assert.ok(STUDENT_RELATION_OPTIONS.some(option => option.value === 'FATHER'))
  assert.equal(studentRelationLabel('GRANDMOTHER_MATERNAL'), '外婆')
  assert.equal(studentBindStatusLabel('PENDING'), '待审核')
  assert.equal(ACTIVE_STUDENT_BINDING_STATUSES.has('APPROVED'), true)
  assert.equal(isActiveStudentBinding({ bindStatus: 'bound' }), true)
  assert.equal(isActiveStudentBinding({ bindStatus: 'REJECTED' }), false)
})

test('student context view model merges only active guardian bindings', () => {
  const binding = guardianBindingToStudent({
    bindingId: 3,
    studentId: 8,
    studentName: '旧名称',
    relationType: 'MOTHER',
    bindStatus: 'APPROVED'
  })
  assert.equal(binding.id, 8)

  const merged = mergeBoundStudents(
    [{ id: 8, name: '小山', studentNo: 'S008' }],
    [
      {
        bindingId: 3,
        studentId: 8,
        studentName: '旧名称',
        relationType: 'MOTHER',
        bindStatus: 'APPROVED'
      },
      {
        bindingId: 4,
        studentId: 9,
        studentName: '未通过',
        bindStatus: 'REJECTED'
      }
    ]
  )

  assert.equal(merged.length, 1)
  assert.equal(merged[0].name, '小山')
  assert.equal(merged[0].bindingId, 3)
  assert.equal(merged[0].relationType, 'MOTHER')
  assert.deepEqual(studentContextList({ bindings: [binding] }, ['bindings']), [binding])
})
