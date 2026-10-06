import assert from 'node:assert/strict'
import test from 'node:test'

import {
  matchesTeacherRosterStudent,
  normalizeTeacherRosterClass,
  normalizeTeacherRosterStudent,
  teacherRosterEnrollmentLabel,
  teacherRosterItems
} from './teacherRosterViewModel.js'

test('teacher roster presentation normalizes classes and students', () => {
  const classItem = normalizeTeacherRosterClass({
    classId: 4,
    className: '向日葵班',
    gradeName: '大班',
    isHeadTeacher: true,
    studentCount: '18'
  })
  const student = normalizeTeacherRosterStudent({
    studentId: 8,
    name: '小山',
    studentNo: 'S008',
    schoolName: '示范幼儿园',
    primaryClass: { classId: 4, className: '向日葵班' },
    classes: [{ classId: 5, className: '兴趣班' }],
    guardianCount: 2,
    enrollmentStatus: 'ACTIVE'
  })

  assert.deepEqual(classItem, {
    id: 4,
    name: '向日葵班',
    gradeName: '大班',
    isHeadTeacher: true,
    studentCount: 18
  })
  assert.deepEqual(student.classIds, [4, 5])
  assert.equal(student.status, '在读')
  assert.equal(teacherRosterEnrollmentLabel('GRADUATED'), '已毕业')
  assert.deepEqual(teacherRosterItems({ classes: [{ id: 1 }] }, 'classes'), [{ id: 1 }])
})

test('teacher roster presentation filters by class and keyword', () => {
  const student = normalizeTeacherRosterStudent({
    id: 8,
    name: '小山',
    studentNo: 'S008',
    schoolName: '示范幼儿园',
    className: '向日葵班',
    classes: [{ classId: 4 }]
  })

  assert.equal(matchesTeacherRosterStudent(student, {
    activeClassId: 4,
    keyword: 'S008'
  }), true)
  assert.equal(matchesTeacherRosterStudent(student, {
    activeClassId: 5,
    keyword: ''
  }), false)
  assert.equal(matchesTeacherRosterStudent(student, {
    activeClassId: '',
    keyword: '其他学校'
  }), false)
})
