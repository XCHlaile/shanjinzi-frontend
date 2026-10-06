import assert from 'node:assert/strict'
import test from 'node:test'

import { useSchoolManagement } from './useSchoolManagement.js'

function createSchoolModel(apiOverrides = {}) {
  const calls = []
  const messages = []
  const api = {
    async fetchSchools(params) {
      calls.push(['list', params])
      const items = [
        { id: 1, name: '山前幼儿园', contactName: '赵老师', status: 'ACTIVE' },
        { id: 2, name: '青山幼儿园', contactName: '李老师', status: 'DISABLED' }
      ].filter(item => (
        (!params.name || item.name.includes(params.name))
        && (!params.contactName || item.contactName.includes(params.contactName))
        && (!params.status || item.status === params.status)
      ))
      return {
        items,
        total: items.length,
        totalPages: items.length ? 1 : 0
      }
    },
    async fetchSchool(schoolId) {
      calls.push(['detail', schoolId])
      return { id: schoolId, name: '山前幼儿园' }
    },
    async createSchool(payload) {
      calls.push(['create', payload])
      return { id: 3, status: 'ACTIVE', ...payload }
    },
    async updateSchool(schoolId, payload) {
      calls.push(['update', schoolId, payload])
      return { id: schoolId, ...payload }
    },
    async enableSchool(schoolId) {
      calls.push(['enable', schoolId])
    },
    async disableSchool(schoolId) {
      calls.push(['disable', schoolId])
    },
    async exportSchools(filter) {
      calls.push(['export', filter])
      return { blob: new Blob(['schools']), filename: 'schools.csv' }
    },
    ...apiOverrides
  }
  const model = useSchoolManagement({
    api,
    feedback: {
      error(message) {
        messages.push(['error', message])
      },
      success(message) {
        messages.push(['success', message])
      },
      warning(message) {
        messages.push(['warning', message])
      }
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save-file', result.filename, fallbackFilename])
    }
  })

  return { calls, messages, model }
}

test('school management loads and queries paged school records', async () => {
  const { calls, model } = createSchoolModel()

  assert.equal(await model.loadData(), true)
  model.keyword.value = '山前'
  model.contactName.value = '赵老师'
  model.status.value = 'ACTIVE'
  assert.equal(await model.submitSearch(), true)

  assert.deepEqual(calls, [
    ['list', { page: 1, pageSize: 20 }],
    ['list', {
      name: '山前',
      contactName: '赵老师',
      status: 'ACTIVE',
      page: 1,
      pageSize: 20
    }]
  ])
  assert.deepEqual(model.filteredRows.value.map(row => row.id), [1])
  assert.equal(model.pagination.total, 1)
  assert.equal(model.loading.value, false)
})

test('school management changes server pages and page sizes', async () => {
  const { calls, model } = createSchoolModel({
    async fetchSchools(params) {
      calls.push(['list', params])
      return { items: [{ id: params.page }], total: 45, totalPages: Math.ceil(45 / params.pageSize) }
    }
  })

  await model.loadData()
  await model.changePage(2)
  await model.changePageSize(50)

  assert.deepEqual(calls, [
    ['list', { page: 1, pageSize: 20 }],
    ['list', { page: 2, pageSize: 20 }],
    ['list', { page: 1, pageSize: 50 }]
  ])
  assert.equal(model.pagination.page, 1)
  assert.equal(model.pagination.pageSize, 50)
  assert.equal(model.pagination.total, 45)
})

test('school management exports current filters to a browser file', async () => {
  const { calls, messages, model } = createSchoolModel()
  model.keyword.value = ' 山前 '
  model.status.value = 'ACTIVE'

  assert.equal(await model.exportSchools(), true)
  assert.deepEqual(calls, [
    ['export', { keyword: '山前', status: 'ACTIVE' }],
    ['save-file', 'schools.csv', '学校列表.csv']
  ])
  assert.deepEqual(messages, [['success', '学校数据已导出']])
  assert.equal(model.exporting.value, false)
})

test('school management creates and updates strict school payloads', async () => {
  const { calls, messages, model } = createSchoolModel()

  model.openCreate()
  Object.assign(model.form, {
    name: ' 新学校 ',
    contactName: ' 赵老师 ',
    contactPhone: '',
    address: ' 南山区 ',
    description: ''
  })
  assert.equal(await model.saveSchool(), true)

  model.openEdit({ id: 3, name: '新学校', contactName: '赵老师' })
  model.form.contactName = '李老师'
  assert.equal(await model.saveSchool(), true)

  assert.deepEqual(calls, [
    ['create', {
      name: '新学校',
      contactName: '赵老师',
      address: '南山区'
    }],
    ['update', 3, {
      name: '新学校',
      contactName: '李老师'
    }]
  ])
  assert.deepEqual(messages, [
    ['success', '学校已保存'],
    ['success', '学校已保存']
  ])
  assert.equal(model.dialogVisible.value, false)
})

test('school management recovers a successful create after a transport error', async () => {
  const savedSchool = {
    id: 5,
    name: '新学校',
    contactName: '赵老师',
    status: 'ACTIVE'
  }
  const { calls, messages, model } = createSchoolModel({
    async createSchool(payload) {
      calls.push(['create', payload])
      throw new Error('响应中断')
    },
    async fetchSchools(params) {
      calls.push(['list', params])
      return { items: [savedSchool] }
    }
  })
  Object.assign(model.form, { name: '新学校', contactName: '赵老师' })

  assert.equal(await model.saveSchool(), true)
  assert.deepEqual(model.rows.value, [savedSchool])
  assert.deepEqual(messages, [['success', '学校已保存']])
  assert.equal(calls[1][1].name, '新学校')
})

test('school management updates status and reloads the directory', async () => {
  const { calls, messages, model } = createSchoolModel()

  assert.equal(await model.toggleStatus({ id: 1, status: 'ACTIVE' }), true)
  assert.deepEqual(calls, [
    ['disable', 1],
    ['list', { page: 1, pageSize: 20 }]
  ])
  assert.deepEqual(messages, [['success', '状态已更新']])
})

test('school management explains the unsupported delete operation', () => {
  const { messages, model } = createSchoolModel()

  assert.equal(model.removeSchool({ name: '山前幼儿园' }), false)
  assert.deepEqual(messages, [[
    'warning',
    '当前接口未提供学校删除能力，无法删除“山前幼儿园”'
  ]])
})
