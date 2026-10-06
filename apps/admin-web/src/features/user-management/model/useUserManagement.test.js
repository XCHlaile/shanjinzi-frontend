import assert from 'node:assert/strict'
import test from 'node:test'

import { useUserManagement } from './useUserManagement.js'

function createUserModel(apiOverrides = {}) {
  const calls = []
  const messages = []
  const navigations = []
  const api = {
    async fetchUsers(params) {
      calls.push(['list-users', params])
      const items = [
        {
          id: 1,
          phone: '13900000000',
          realName: '张老师',
          roles: ['TEACHER'],
          schoolName: '山前幼儿园',
          status: 'ACTIVE'
        },
        {
          id: 2,
          phone: '13800000000',
          realName: '李家长',
          roles: ['PARENT'],
          status: 'DISABLED'
        }
      ].filter(item => (
        (!params.phone || item.phone.includes(params.phone))
        && (!params.realName || item.realName.includes(params.realName))
        && (!params.roleCode || item.roles.includes(params.roleCode))
        && (!params.status || item.status === params.status)
      ))
      return {
        items,
        total: items.length,
        totalPages: items.length ? 1 : 0
      }
    },
    async fetchSchools(params) {
      calls.push(['list-schools', params])
      return {
        items: [
          { id: 3, name: '山前幼儿园', status: 'ACTIVE' },
          { id: 4, name: '青山幼儿园', status: 'DISABLED' }
        ]
      }
    },
    async fetchUser(userId) {
      calls.push(['detail', userId])
      return { id: userId, phone: '13900000000', realName: '张老师' }
    },
    async createUser(payload) {
      calls.push(['create', payload])
      return { id: 5, status: 'ACTIVE', ...payload }
    },
    async updateUser(userId, payload) {
      calls.push(['update', userId, payload])
      return { id: userId, ...payload }
    },
    async updateUserRole(userId, payload) {
      calls.push(['role', userId, payload])
      return { id: userId, ...payload }
    },
    async updateUserSchool(userId, payload) {
      calls.push(['school', userId, payload])
      return { id: userId, ...payload }
    },
    async enableUser(userId) {
      calls.push(['enable', userId])
    },
    async disableUser(userId) {
      calls.push(['disable', userId])
    },
    async resetUserPassword(userId) {
      calls.push(['reset-password', userId])
      return { temporaryPassword: 'temp-123' }
    },
    async deleteUser(userId) {
      calls.push(['delete', userId])
    },
    async exportUsers(filter) {
      calls.push(['export', filter])
      return { blob: new Blob(['users']), filename: 'users.csv' }
    },
    ...apiOverrides
  }
  const model = useUserManagement({
    api,
    dialogs: {
      async alert(...args) {
        calls.push(['alert', ...args])
      },
      async confirm(...args) {
        calls.push(['confirm', ...args])
      }
    },
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
    onUnauthorized() {
      navigations.push('/login')
    },
    saveFile(result, fallbackFilename) {
      calls.push(['save-file', result.filename, fallbackFilename])
    }
  })

  return { calls, messages, model, navigations }
}

test('user management loads and queries paged users with school options', async () => {
  const { calls, model } = createUserModel()

  assert.equal(await model.loadData(), true)
  model.keyword.value = '张老师'
  model.role.value = 'TEACHER'
  model.status.value = 'ACTIVE'
  assert.equal(await model.submitSearch(), true)

  assert.deepEqual(calls, [
    ['list-users', { page: 1, pageSize: 20 }],
    ['list-schools', { page: 1, pageSize: 100 }],
    ['list-users', {
      realName: '张老师',
      roleCode: 'TEACHER',
      status: 'ACTIVE',
      page: 1,
      pageSize: 20
    }]
  ])
  assert.deepEqual(model.filteredRows.value.map(row => row.id), [1])
  assert.equal(model.rows.value[0].displayName, '张老师')
  assert.deepEqual(model.schools.value.map(school => school.id), [3])
  assert.equal(model.pagination.total, 1)
})

test('user management changes server pages and page sizes without reloading options', async () => {
  const { calls, model } = createUserModel({
    async fetchUsers(params) {
      calls.push(['list-users', params])
      return { items: [{ id: params.page }], total: 45, totalPages: Math.ceil(45 / params.pageSize) }
    }
  })

  await model.loadData()
  await model.changePage(2)
  await model.changePageSize(50)

  assert.deepEqual(calls, [
    ['list-users', { page: 1, pageSize: 20 }],
    ['list-schools', { page: 1, pageSize: 100 }],
    ['list-users', { page: 2, pageSize: 20 }],
    ['list-users', { page: 1, pageSize: 50 }]
  ])
  assert.equal(model.pagination.page, 1)
  assert.equal(model.pagination.pageSize, 50)
  assert.equal(model.pagination.total, 45)
})

test('user management keeps the user list usable when school options fail', async () => {
  const { messages, model } = createUserModel({
    async fetchSchools() {
      throw new Error('学校接口失败')
    }
  })

  assert.equal(await model.loadData(), true)
  assert.equal(model.rows.value.length, 2)
  assert.deepEqual(model.schools.value, [])
  assert.deepEqual(messages, [[
    'warning',
    '学校选项加载失败，用户列表仍可正常查看'
  ]])
})

test('user management exports the current filters', async () => {
  const { calls, messages, model } = createUserModel()
  model.keyword.value = ' 张老师 '
  model.role.value = 'TEACHER'
  model.status.value = 'ACTIVE'

  assert.equal(await model.exportUsers(), true)
  assert.deepEqual(calls, [
    ['export', {
      keyword: '张老师',
      role: 'TEACHER',
      status: 'ACTIVE'
    }],
    ['save-file', 'users.csv', '用户列表.csv']
  ])
  assert.deepEqual(messages, [['success', '用户数据已导出']])
})

test('user management creates a strict user payload after checking duplicates', async () => {
  const { calls, messages, model } = createUserModel()
  model.openCreate()
  Object.assign(model.form, {
    phone: ' 13700000000 ',
    realName: ' 王老师 ',
    roleCode: 'TEACHER',
    schoolId: '3',
    nickname: '',
    gender: 'FEMALE'
  })

  assert.equal(await model.saveUser(), true)
  assert.deepEqual(calls, [
    ['list-users', { page: 1, pageSize: 100, phone: '13700000000' }],
    ['create', {
      phone: '13700000000',
      realName: '王老师',
      roleCode: 'TEACHER',
      schoolId: 3,
      gender: 'FEMALE'
    }]
  ])
  assert.equal(model.rows.value[0].displayName, '王老师')
  assert.deepEqual(messages, [['success', '用户已保存']])
})

test('user management sends user fields, role and school through separate updates', async () => {
  const { calls, model } = createUserModel()
  model.openEdit({
    id: 1,
    phone: '13900000000',
    realName: '旧姓名',
    roles: ['PARENT'],
    schoolId: 2
  })
  Object.assign(model.form, {
    realName: '新姓名',
    roleCode: 'TEACHER',
    schoolId: 3
  })

  assert.equal(await model.saveUser(), true)
  assert.deepEqual(calls, [
    ['update', 1, { realName: '新姓名' }],
    ['role', 1, { roleCode: 'TEACHER' }],
    ['school', 1, { schoolId: 3 }]
  ])
})

test('user management recovers a successful create after a response error', async () => {
  let lookupCount = 0
  const savedUser = {
    id: 7,
    phone: '13700000000',
    realName: '王老师',
    roles: ['PARENT']
  }
  const { messages, model } = createUserModel({
    async fetchUsers() {
      lookupCount += 1
      return { items: lookupCount === 1 ? [] : [savedUser] }
    },
    async createUser() {
      throw new Error('响应中断')
    }
  })
  Object.assign(model.form, {
    phone: savedUser.phone,
    realName: savedUser.realName,
    roleCode: 'PARENT'
  })

  assert.equal(await model.saveUser(), true)
  assert.deepEqual(model.rows.value, [{
    ...savedUser,
    role: 'PARENT',
    roleCode: 'PARENT',
    displayName: '王老师'
  }])
  assert.deepEqual(messages, [['success', '用户已保存']])
})

test('user management owns status, password and delete workflows', async () => {
  const { calls, model } = createUserModel()

  assert.equal(await model.setDisabled({ id: 1 }), true)
  assert.equal(await model.setEnabled({ id: 2 }), true)
  assert.equal(await model.resetPassword({ id: 1 }), true)
  assert.equal(await model.removeUser({ id: 2, phone: '13800000000' }), true)

  assert.ok(calls.some(call => call[0] === 'disable' && call[1] === 1))
  assert.ok(calls.some(call => call[0] === 'enable' && call[1] === 2))
  assert.ok(calls.some(call => call[0] === 'reset-password' && call[1] === 1))
  assert.ok(calls.some(call => call[0] === 'alert' && call[1] === '临时密码：temp-123'))
  assert.ok(calls.some(call => call[0] === 'confirm' && call[1].includes('13800000000')))
  assert.ok(calls.some(call => call[0] === 'delete' && call[1] === 2))
})

test('user management redirects unauthorized operations to login', async () => {
  const unauthorized = Object.assign(new Error('未登录'), { status: 401 })
  const { messages, model, navigations } = createUserModel({
    async fetchUsers() {
      throw unauthorized
    }
  })

  assert.equal(await model.loadData(), false)
  assert.deepEqual(messages, [['error', '登录已过期，请重新登录']])
  assert.deepEqual(navigations, ['/login'])
})
