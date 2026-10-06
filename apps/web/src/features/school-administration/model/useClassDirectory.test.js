import assert from 'node:assert/strict'
import test from 'node:test'

import { useClassDirectory } from './useClassDirectory.js'

function createDirectory(apiOverrides = {}, options = {}) {
  const calls = []
  const successes = []
  const api = {
    async fetchPublicSchoolDetail(id) {
      calls.push(['school', id])
      return { id, name: '山金子小学' }
    },
    async fetchPublicClasses(query) {
      calls.push(['classes', query])
      return {
        items: [
          { id: 1, name: '一班', schoolId: 3 },
          { id: 2, name: '其他学校班级', schoolId: 4 }
        ],
        total: 1,
        totalPages: 1
      }
    },
    async createPublicClass(payload) {
      calls.push(['create', payload])
      return { id: 5 }
    },
    async updatePublicClass(id, payload) {
      calls.push(['update', id, payload])
      return { id }
    },
    async fetchPublicClassDetail(id) {
      calls.push(['detail', id])
      return { id, schoolId: 3 }
    },
    ...apiOverrides
  }
  const directory = useClassDirectory({
    api,
    readRole: () => options.role || 'SCHOOL_ADMIN',
    readCurrentUser: () => options.user || { schoolId: 3 },
    refreshUser: async () => options.refreshedUser || { schoolId: 3 },
    notify: { success: message => successes.push(message) }
  })
  return { calls, directory, successes }
}

test('class directory resolves the current school and loads scoped classes', async () => {
  const { calls, directory } = createDirectory()
  directory.setRelatedLoader(async () => calls.push(['teachers']))

  assert.equal(await directory.initialize(), true)

  assert.equal(directory.schoolId.value, 3)
  assert.equal(directory.schoolName.value, '山金子小学')
  assert.deepEqual(directory.rows.value.map(item => item.id), [1])
  assert.deepEqual(calls, [
    ['school', 3],
    ['classes', {
      schoolId: 3,
      name: undefined,
      gradeName: undefined,
      page: 1,
      pageSize: 20
    }],
    ['teachers']
  ])
  assert.equal(directory.loading.value, false)
})

test('class directory owns search, reset, and pagination queries', async () => {
  const { calls, directory } = createDirectory()
  directory.schoolId.value = 3
  directory.filters.name = '一'
  directory.filters.gradeName = '一年级'

  await directory.searchClasses()
  await directory.changePage(2)
  await directory.resetFilters()

  const queries = calls
    .filter(call => call[0] === 'classes')
    .map(call => call[1])
  assert.deepEqual(queries.map(query => query.page), [1, 2, 1])
  assert.equal(queries[0].name, '一')
  assert.equal(queries[0].gradeName, '一年级')
  assert.equal(queries[2].name, undefined)
  assert.equal(queries[2].gradeName, undefined)
})

test('class directory creates and verifies a school class', async () => {
  const { calls, directory, successes } = createDirectory()
  directory.schoolId.value = 3
  directory.openCreate()
  Object.assign(directory.classForm, {
    name: ' 二班 ',
    gradeName: '一年级',
    sortOrder: 2
  })

  assert.equal(await directory.saveClass(), true)

  assert.deepEqual(calls.slice(0, 2), [
    ['create', {
      name: ' 二班 ',
      gradeName: '一年级',
      sortOrder: 2,
      schoolId: 3
    }],
    ['detail', 5]
  ])
  assert.deepEqual(successes, ['班级已创建'])
  assert.equal(directory.classDialogVisible.value, false)
  assert.equal(directory.saving.value, false)
})

test('class directory rejects roles and cross-school verification', async () => {
  const forbidden = createDirectory({}, { role: 'PARENT' }).directory
  assert.equal(await forbidden.initialize(), false)
  assert.match(forbidden.loadError.value, /校方管理员/)

  const { directory } = createDirectory({
    async fetchPublicClassDetail(id) {
      return { id, schoolId: 4 }
    }
  })
  directory.schoolId.value = 3
  directory.classForm.name = '三班'
  assert.equal(await directory.saveClass(), false)
  assert.match(directory.formError.value, /不属于当前学校/)
})
