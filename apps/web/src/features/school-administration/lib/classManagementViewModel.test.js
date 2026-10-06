import assert from 'node:assert/strict'
import test from 'node:test'

import {
  collectAllPages,
  sameIdSet,
  schoolIdOf,
  schoolNameOf,
  studentClassId,
  studentIdentity,
  studentMatchesKeyword,
  studentOptionLabel,
  teacherBelongsToClass,
  teacherDisplayName,
  teacherMatchesKeyword
} from '../index.js'

test('class management view model resolves school and teacher context', () => {
  const teacher = {
    id: 4,
    realName: '林老师',
    phone: '13800000000',
    classes: [{ classId: 8 }]
  }

  assert.equal(schoolIdOf({ school: { schoolId: 12 } }), 12)
  assert.equal(schoolNameOf({ organizationName: '山巾子幼儿园' }), '山巾子幼儿园')
  assert.equal(teacherDisplayName(teacher), '林老师')
  assert.equal(teacherBelongsToClass(teacher, '8'), true)
  assert.equal(teacherMatchesKeyword(teacher, '1380'), true)
  assert.equal(teacherMatchesKeyword(teacher, '其他'), false)
})

test('class management view model resolves student class labels and search', () => {
  const student = {
    id: 7,
    name: '小树',
    studentNo: 'S007',
    classes: [
      { classId: 2, isPrimary: true },
      { classId: 3 }
    ]
  }

  assert.equal(studentClassId(student), 2)
  assert.equal(studentIdentity(student), '学号：S007')
  assert.equal(studentMatchesKeyword(student, 's007'), true)
  assert.equal(studentOptionLabel(student, [{ id: 2, name: '二班' }]), '小树 · 学号：S007 · 二班')
})

test('class management view model collects pages and compares id sets', async () => {
  const pages = []
  const items = await collectAllPages(page => {
    pages.push(page)
    return Promise.resolve({
      items: [{ id: page }],
      pageSize: 1,
      totalPages: 3
    })
  })

  assert.deepEqual(pages, [1, 2, 3])
  assert.deepEqual(items.map(item => item.id), [1, 2, 3])
  assert.equal(sameIdSet([3, 2, 2], ['2', '3']), true)
  assert.equal(sameIdSet([2], [2, 3]), false)
})
