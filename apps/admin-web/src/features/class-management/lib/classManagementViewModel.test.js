import assert from 'node:assert/strict'
import test from 'node:test'

import {
  activeSchools,
  availableStudents,
  classExportFilter,
  classForm,
  classListParams,
  classOptionLabel,
  classStudents,
  classTeacherNames,
  collectAllPages,
  emptyClassForm,
  mergeTeachers,
  studentClassIds,
  studentOptionLabel,
  studentWithClassDetail,
  teacherBelongsToClass,
  teacherLabel,
  transferClassOptions
} from './classManagementViewModel.js'

test('class view model owns forms, filters and active schools', () => {
  assert.deepEqual(emptyClassForm(2), {
    schoolId: 2,
    name: '',
    gradeName: '',
    sortOrder: null
  })
  assert.deepEqual(classForm({ name: '大一班', sortOrder: 0 }), {
    schoolId: null,
    name: '大一班',
    gradeName: '',
    sortOrder: 0
  })
  const filters = {
    schoolId: 2,
    name: '大一班',
    gradeName: '',
    status: 'ACTIVE'
  }
  assert.deepEqual(classListParams(filters, { page: 3, pageSize: 20 }), {
    schoolId: 2,
    name: '大一班',
    gradeName: undefined,
    status: 'ACTIVE',
    page: 3,
    pageSize: 20
  })
  assert.equal(classExportFilter(filters).schoolId, 2)
  assert.deepEqual(activeSchools({
    items: [
      { id: 1, status: 'ACTIVE' },
      { id: 2, status: 'DISABLED' }
    ]
  }), [{ id: 1, status: 'ACTIVE' }])
})

test('class view model normalizes teacher membership and labels', () => {
  const teachers = mergeTeachers(
    [{ id: 5, phone: '13900000000', roles: ['TEACHER'] }],
    [{ id: 5, realName: '张老师', classes: [{ classId: 2 }] }]
  )
  assert.equal(teachers.length, 1)
  assert.equal(teacherBelongsToClass(teachers[0], 2), true)
  assert.equal(teacherLabel(teachers[0]), '张老师')
  assert.equal(classTeacherNames(teachers), '张老师')
  assert.equal(classTeacherNames(undefined), '加载中…')
})

test('class view model collects paged records', async () => {
  const pages = []
  const items = await collectAllPages(async page => {
    pages.push(page)
    return {
      items: [{ id: page }],
      pageSize: 1,
      totalPages: 3
    }
  })
  assert.deepEqual(pages, [1, 2, 3])
  assert.deepEqual(items.map(item => item.id), [1, 2, 3])
})

test('class view model derives student class state and options', () => {
  const student = studentWithClassDetail(
    { id: 7, name: '小山', schoolId: 3, status: 'ACTIVE' },
    { classes: [{ classId: 2, className: '大一班', isPrimary: true }] }
  )
  assert.equal(student.classId, 2)
  assert.deepEqual(studentClassIds(student), [2, 2])
  assert.deepEqual(classStudents([student], 2), [student])
  assert.deepEqual(availableStudents([student], 1), [student])
  assert.deepEqual(transferClassOptions([
    { id: 1, name: '大一班' },
    { id: 2, name: '大二班' }
  ], 1), [{ id: 2, name: '大二班' }])
  assert.match(studentOptionLabel(student), /小山/)
  assert.equal(classOptionLabel({ name: '大一班', gradeName: '大班' }), '大一班（大班）')
})
