import assert from 'node:assert/strict'
import test from 'node:test'

import {
  activityBoundaryText,
  activityFileIds,
  activityListTitle,
  activityPageItems,
  activitySchoolId,
  activityVisibilityDetails,
  availableActivityStudents,
  normalizeActivityClass,
  normalizeActivityMoment,
  normalizeActivityStudent,
  retainAvailableStudentIds
} from '../index.js'

test('activity view model normalizes moments and publishing options', () => {
  assert.deepEqual(activityPageItems({ moments: [{ momentId: 3 }] }), [{ momentId: 3 }])
  assert.deepEqual(
    normalizeActivityMoment({
      momentId: 3,
      contentPreview: '活动摘要',
      visibility: 'SCHOOL',
      likesCount: 4,
      commentsCount: 2
    }),
    {
      momentId: 3,
      contentPreview: '活动摘要',
      visibility: 'SCHOOL',
      likesCount: 4,
      commentsCount: 2,
      id: 3,
      content: '活动摘要',
      className: '全校',
      author: '-',
      media: [],
      mediaType: '文字',
      publishedAt: '-',
      likes: 4,
      likedByMe: false,
      comments: 2
    }
  )
  assert.deepEqual(
    normalizeActivityClass({ classId: 8, className: '一班', gradeName: '小班', studentCount: 21 }),
    { id: 8, label: '一班（小班 · 21 名学生）' }
  )
})

test('activity view model applies class visibility and selection rules', () => {
  const teacherStudent = normalizeActivityStudent({
    studentId: 7,
    name: '小树',
    studentNo: 'S007',
    classes: [
      { classId: 2, className: '二班', primary: true },
      { classId: 3, className: '三班' }
    ]
  })
  const schoolStudent = normalizeActivityStudent({
    studentId: 8,
    name: '小山',
    classId: 2,
    className: '二班'
  }, { schoolScope: true })
  const available = availableActivityStudents(
    [teacherStudent, schoolStudent],
    'CLASS',
    '2'
  )

  assert.deepEqual(teacherStudent.classIds, [2, 3])
  assert.deepEqual(schoolStudent.classIds, [2])
  assert.deepEqual(available.map(student => student.id), [7, 8])
  assert.deepEqual(retainAvailableStudentIds([7, 9], available), [7])
  assert.deepEqual(availableActivityStudents([teacherStudent], 'SCHOOL', 2), [])
})

test('activity view model centralizes role copy and identifiers', () => {
  assert.match(activityBoundaryText('parent'), /当前学生/)
  assert.equal(activityListTitle('school', 'visible'), '本校全部幼儿动态')
  assert.deepEqual(activityVisibilityDetails('SCHOOL'), {
    title: '全校可见',
    description: '发布后，本校用户均可查看此动态'
  })
  assert.equal(activitySchoolId({ school: { schoolId: 12 } }), 12)
  assert.deepEqual(activityFileIds([{ fileId: '5' }, { fileId: 'bad' }]), [5])
})
