import assert from 'node:assert/strict'
import test from 'node:test'

import {
  emptySchoolForm,
  matchesSchool,
  schoolExportFilter,
  schoolDirectoryQuery,
  schoolForm,
  schoolPageItems,
  schoolStatusLabel,
  shortSchoolDate
} from './schoolManagementViewModel.js'

test('school view model normalizes pages, forms, and statuses', () => {
  const row = {
    id: 2,
    name: '山前幼儿园',
    contactName: '赵老师',
    contactPhone: '13900000000',
    address: '南山区',
    description: '学校介绍'
  }

  assert.equal(schoolPageItems({ items: [row] })[0], row)
  assert.deepEqual(schoolPageItems(null), [])
  assert.deepEqual(schoolForm(row), {
    name: '山前幼儿园',
    contactName: '赵老师',
    contactPhone: '13900000000',
    address: '南山区',
    description: '学校介绍'
  })
  assert.deepEqual(emptySchoolForm(), {
    name: '',
    contactName: '',
    contactPhone: '',
    address: '',
    description: ''
  })
  assert.equal(schoolStatusLabel('ACTIVE'), '合作中')
  assert.equal(schoolStatusLabel('CUSTOM'), 'CUSTOM')
})

test('school view model filters rows and builds compact export filters', () => {
  const row = {
    name: '山前幼儿园',
    contactName: '赵老师',
    contactPhone: '13900000000',
    status: 'ACTIVE'
  }

  assert.equal(matchesSchool(row, { keyword: '赵老师', status: 'ACTIVE' }), true)
  assert.equal(matchesSchool(row, { keyword: '李老师' }), false)
  assert.equal(matchesSchool(row, { status: 'DISABLED' }), false)
  assert.deepEqual(schoolExportFilter({ keyword: ' 山前 ', status: 'ACTIVE' }), {
    keyword: '山前',
    status: 'ACTIVE'
  })
  assert.deepEqual(schoolExportFilter(), {})
})

test('school view model formats backend timestamps', () => {
  assert.equal(shortSchoolDate('2026-07-31T12:34:56.000Z'), '2026-07-31 12:34:56')
  assert.equal(shortSchoolDate(null), '')
})

test('school view model builds backend directory queries', () => {
  assert.deepEqual(schoolDirectoryQuery({
    keyword: ' 山前 ',
    contactName: ' 赵老师 ',
    status: 'ACTIVE'
  }, { page: 2, pageSize: 50 }), {
    name: '山前',
    contactName: '赵老师',
    status: 'ACTIVE',
    page: 2,
    pageSize: 50
  })
})
