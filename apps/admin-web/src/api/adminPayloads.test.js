import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  classCreatePayload,
  classTeachersPayload,
  classUpdatePayload,
  countBoundGuardians,
  competitionInfoUrlPayload,
  competitionMatchesPayload,
  competitionPayload,
  newsArticleCategoryPayload,
  newsArticlePayload,
  newsCategoryPayload,
  newsCategoryUpdatePayload,
  newsArticleMatchesPayload,
  newsCategoryMatchesPayload,
  newsPinPayload,
  newsSchedulePayload,
  newsSortOrderPayload,
  normalizeNewsArticle,
  normalizeNewsCategory,
  normalizeAdminUser,
  normalizeCompetition,
  primaryStudentClass,
  schoolMatchesPayload,
  schoolPayload,
  teacherClassesPayload,
  upsertClassRows,
  upsertCompetitionRows,
  upsertSchoolRows,
  upsertUserRows,
  changedUserUpdatePayload,
  userCreatePayload,
  userMatchesPayload,
  userRolePayload,
  userSchoolPayload,
  userUpdatePayload
} from './adminPayloads.js'

const openapi2 = JSON.parse(readFileSync(new URL('../../../../../docs/api/2openap.json', import.meta.url), 'utf8'))
const openapi9 = JSON.parse(readFileSync(new URL('../../../../../docs/api/9openapi.json', import.meta.url), 'utf8'))
const openapi12 = JSON.parse(readFileSync(new URL('../../../../../docs/api/12openapi.json', import.meta.url), 'utf8'))
const schoolsSource = readFileSync(new URL('../views/Schools.vue', import.meta.url), 'utf8')
const schoolManagementSource = readFileSync(new URL('../features/school-management/model/useSchoolManagement.js', import.meta.url), 'utf8')
const usersSource = readFileSync(new URL('../views/Users.vue', import.meta.url), 'utf8')
const userManagementFacadeSource = readFileSync(new URL('../features/user-management/model/useUserManagement.js', import.meta.url), 'utf8')
const userDirectorySource = readFileSync(new URL('../features/user-management/model/useUserDirectory.js', import.meta.url), 'utf8')
const userEditorSource = readFileSync(new URL('../features/user-management/model/useUserEditor.js', import.meta.url), 'utf8')
const userAccountActionsSource = readFileSync(new URL('../features/user-management/model/useUserAccountActions.js', import.meta.url), 'utf8')
const userManagementSource = [
  userManagementFacadeSource,
  userDirectorySource,
  userEditorSource,
  userAccountActionsSource
].join('\n')
const userManagementApiSource = readFileSync(new URL('../features/user-management/api/userManagementApi.js', import.meta.url), 'utf8')
const bindingsSource = readFileSync(new URL('../views/Bindings.vue', import.meta.url), 'utf8')
const classDirectoryFacadeSource = readFileSync(new URL('../features/class-management/model/useClassDirectory.js', import.meta.url), 'utf8')
const classListSource = readFileSync(new URL('../features/class-management/model/useClassList.js', import.meta.url), 'utf8')
const classEditorSource = readFileSync(new URL('../features/class-management/model/useClassEditor.js', import.meta.url), 'utf8')
const classActionsSource = readFileSync(new URL('../features/class-management/model/useClassActions.js', import.meta.url), 'utf8')
const classDirectorySource = [
  classDirectoryFacadeSource,
  classListSource,
  classEditorSource,
  classActionsSource
].join('\n')
const classTeacherAssignmentSource = readFileSync(new URL('../features/class-management/model/useClassTeacherAssignment.js', import.meta.url), 'utf8')
const competitionsSource = readFileSync(new URL('../views/Competitions.vue', import.meta.url), 'utf8')
const competitionFormDialogSource = readFileSync(new URL('../features/competition-management/ui/CompetitionFormDialog.vue', import.meta.url), 'utf8')
const competitionRegistrationDialogSource = readFileSync(new URL('../features/competition-management/ui/CompetitionRegistrationDialog.vue', import.meta.url), 'utf8')
const competitionViewSource = `${competitionsSource}\n${competitionFormDialogSource}\n${competitionRegistrationDialogSource}`
const competitionManagementFacadeSource = readFileSync(new URL('../features/competition-management/model/useCompetitionManagement.js', import.meta.url), 'utf8')
const competitionDirectorySource = readFileSync(new URL('../features/competition-management/model/useCompetitionDirectory.js', import.meta.url), 'utf8')
const competitionEditorSource = readFileSync(new URL('../features/competition-management/model/useCompetitionEditor.js', import.meta.url), 'utf8')
const competitionActionsSource = readFileSync(new URL('../features/competition-management/model/useCompetitionActions.js', import.meta.url), 'utf8')
const competitionRegistrationsSource = readFileSync(new URL('../features/competition-management/model/useCompetitionRegistrations.js', import.meta.url), 'utf8')
const competitionManagementSource = [
  competitionManagementFacadeSource,
  competitionDirectorySource,
  competitionEditorSource,
  competitionActionsSource,
  competitionRegistrationsSource
].join('\n')
const competitionManagementApiSource = readFileSync(new URL('../features/competition-management/api/competitionManagementApi.js', import.meta.url), 'utf8')
const newsSource = readFileSync(new URL('../views/News.vue', import.meta.url), 'utf8')
const newsArticleDialogSource = readFileSync(new URL('../features/news-management/ui/NewsArticleDialog.vue', import.meta.url), 'utf8')
const newsMaintenanceDialogsSource = readFileSync(new URL('../features/news-management/ui/NewsMaintenanceDialogs.vue', import.meta.url), 'utf8')
const newsViewSource = `${newsSource}\n${newsArticleDialogSource}\n${newsMaintenanceDialogsSource}`
const newsManagementFacadeSource = readFileSync(new URL('../features/news-management/model/useNewsManagement.js', import.meta.url), 'utf8')
const newsDirectorySource = readFileSync(new URL('../features/news-management/model/useNewsDirectory.js', import.meta.url), 'utf8')
const newsEditorSource = readFileSync(new URL('../features/news-management/model/useNewsEditor.js', import.meta.url), 'utf8')
const newsArticleActionsSource = readFileSync(new URL('../features/news-management/model/useNewsArticleActions.js', import.meta.url), 'utf8')
const newsCategoryManagementSource = readFileSync(new URL('../features/news-management/model/useNewsCategoryManagement.js', import.meta.url), 'utf8')
const newsManagementSource = [
  newsManagementFacadeSource,
  newsDirectorySource,
  newsEditorSource,
  newsArticleActionsSource,
  newsCategoryManagementSource
].join('\n')
const newsManagementApiSource = readFileSync(new URL('../features/news-management/api/newsManagementApi.js', import.meta.url), 'utf8')

test('counts actual bound guardians instead of trusting the student list count', () => {
  assert.equal(countBoundGuardians([
    { guardianUserId: 1, bindStatus: 'BOUND' },
    { guardianUserId: 2, bindStatus: 'BOUND' },
    { guardianUserId: 3, bindStatus: 'UNBOUND' }
  ]), 2)
  assert.equal(countBoundGuardians({ items: [{ guardianUserId: 4 }] }), 1)
  assert.equal(countBoundGuardians(null), 0)
})

test('uses the primary class from student detail when the list omits class fields', () => {
  assert.deepEqual(primaryStudentClass({
    classes: [
      { classId: 2, className: '兴趣班', isPrimary: false },
      { classId: 4, className: '小一班', isPrimary: true }
    ]
  }), { classId: 4, className: '小一班', isPrimary: true })
  assert.deepEqual(primaryStudentClass({ classes: [{ classId: 1, className: '中一班' }] }), {
    classId: 1,
    className: '中一班'
  })
  assert.equal(primaryStudentClass({}), null)
})

test('maps school form fields to the 2openap create and update request body', () => {
  assert.deepEqual(
    schoolPayload({
      name: '山前幼儿园',
      status: 'DISABLED',
      contactName: '赵老师',
      contactPhone: '13900000000',
      address: '深圳市南山区',
      remark: '旧备注',
      description: '学校介绍',
      logoFileId: '42'
    }),
    {
      name: '山前幼儿园',
      address: '深圳市南山区',
      contactName: '赵老师',
      contactPhone: '13900000000',
      logoFileId: 42,
      description: '学校介绍'
    }
  )
})

test('omits blank optional school request fields instead of sending legacy values', () => {
  assert.deepEqual(
    schoolPayload({
      name: '山前幼儿园',
      status: 'ACTIVE',
      contactName: '',
      contactPhone: '',
      address: '',
      remark: '旧备注',
      description: '',
      logoFileId: ''
    }),
    { name: '山前幼儿园' }
  )
})

test('school form follows 2openap fields instead of posting the whole dialog model', () => {
  assert.ok(schoolManagementSource.includes('schoolPayload(form)'))
  assert.ok(schoolsSource.includes('v-model="form.description"'))
  assert.ok(!schoolsSource.includes('v-model="form.remark"'))
  assert.ok(!schoolsSource.includes('v-model="form.status"'))
  assert.ok(!schoolsSource.includes('body: form'))
})

test('updates the current school table from the saved 2openap response', () => {
  assert.deepEqual(
    upsertSchoolRows([{ id: 1, name: '旧学校' }], { id: 2, name: '新学校', status: 'ACTIVE' }),
    [
      { id: 2, name: '新学校', status: 'ACTIVE' },
      { id: 1, name: '旧学校' }
    ]
  )
  assert.deepEqual(
    upsertSchoolRows([{ id: 1, name: '旧学校', contactName: '旧联系人' }], { id: 1, name: '新学校' }),
    [{ id: 1, name: '新学校', contactName: '旧联系人' }]
  )
})

test('matches a saved school response against the submitted 2openap payload', () => {
  assert.equal(
    schoolMatchesPayload(
      {
        name: '山前幼儿园',
        address: '深圳市南山区',
        contactName: '赵老师',
        contactPhone: '13900000000',
        logoFileId: 42,
        description: '学校介绍'
      },
      {
        name: '山前幼儿园',
        address: '深圳市南山区',
        contactName: '赵老师',
        contactPhone: '13900000000',
        logoFileId: 42,
        description: '学校介绍'
      }
    ),
    true
  )
  assert.equal(
    schoolMatchesPayload(
      { name: '山前幼儿园', contactPhone: '13900000001' },
      { name: '山前幼儿园', contactPhone: '13900000000' }
    ),
    false
  )
})

test('school save path does not report a saved school as failed when list refresh breaks', () => {
  const saveSchoolBody = schoolManagementSource.slice(
    schoolManagementSource.indexOf('async function saveSchool'),
    schoolManagementSource.indexOf('async function toggleStatus')
  )
  assert.ok(saveSchoolBody.includes('upsertSchoolRows(rows.value, savedSchool)'))
  assert.ok(!saveSchoolBody.includes('await loadData()'))
})

test('school save path verifies the database state before showing server errors', () => {
  const saveSchoolBody = schoolManagementSource.slice(
    schoolManagementSource.indexOf('async function saveSchool'),
    schoolManagementSource.indexOf('async function toggleStatus')
  )
  assert.ok(saveSchoolBody.includes('recoverSavedSchool(payload, editingId.value)'))
  assert.ok(saveSchoolBody.includes('if (savedSchool) {'))
  assert.ok(saveSchoolBody.includes('feedback.success'))
  assert.ok(saveSchoolBody.includes('feedback.error(error.message'))
})

test('maps admin user form fields to 2openap create and update request bodies', () => {
  const form = {
    phone: ' 13900000000 ',
    password: 'legacy-secret',
    realName: ' 张老师 ',
    roleCode: 'TEACHER',
    schoolId: '42',
    nickname: ' 老张 ',
    childName: 'legacy child',
    status: 'DISABLED',
    gender: 'MALE'
  }
  assert.deepEqual(userCreatePayload(form), {
    phone: '13900000000',
    realName: '张老师',
    roleCode: 'TEACHER',
    schoolId: 42,
    nickname: '老张',
    gender: 'MALE'
  })
  assert.deepEqual(userUpdatePayload(form), {
    phone: '13900000000',
    realName: '张老师',
    nickname: '老张',
    gender: 'MALE'
  })
  assert.deepEqual(userRolePayload(form), { roleCode: 'TEACHER' })
  assert.deepEqual(userSchoolPayload(form), { schoolId: 42 })
})

test('maps admin user edit forms to partial update fields only', () => {
  assert.deepEqual(
    changedUserUpdatePayload(
      {
        phone: '13900000000',
        realName: '新姓名',
        nickname: '老张',
        gender: '',
        roleCode: 'TEACHER',
        schoolId: 42
      },
      {
        phone: '13900000000',
        realName: '旧姓名',
        nickname: '老张',
        gender: '',
        roleCode: 'PARENT',
        schoolId: 42
      }
    ),
    { realName: '新姓名' }
  )
})

test('normalizes and updates admin user table rows from 2openap responses', () => {
  assert.deepEqual(
    normalizeAdminUser({ id: 1, phone: '13900000000', realName: '张老师', nickname: '老张', roles: ['TEACHER'] }),
    {
      id: 1,
      phone: '13900000000',
      realName: '张老师',
      nickname: '老张',
      roles: ['TEACHER'],
      role: 'TEACHER',
      roleCode: 'TEACHER',
      displayName: '张老师'
    }
  )
  assert.deepEqual(
    upsertUserRows([{ id: 1, phone: '13900000000', realName: '旧姓名', roles: ['PARENT'] }], { id: 1, realName: '新姓名', roles: ['TEACHER'] }),
    [{ id: 1, phone: '13900000000', realName: '新姓名', roles: ['TEACHER'], role: 'TEACHER', roleCode: 'TEACHER', displayName: '新姓名' }]
  )
})

test('matches a saved admin user response against the submitted 2openap payload', () => {
  assert.equal(
    userMatchesPayload(
      { phone: '13900000000', realName: '张老师', nickname: '老张', roles: ['TEACHER'], schoolId: 42 },
      { phone: '13900000000', realName: '张老师', nickname: '老张', roleCode: 'TEACHER', schoolId: 42 }
    ),
    true
  )
  assert.equal(
    userMatchesPayload(
      { phone: '13900000000', realName: '张老师', roles: ['PARENT'], schoolId: 42 },
      { phone: '13900000000', realName: '张老师', roleCode: 'TEACHER', schoolId: 42 }
    ),
    false
  )
})

test('admin user feature follows 2openap user request rules', () => {
  const saveUserBody = userEditorSource.slice(
    userEditorSource.indexOf('async function saveUser'),
    userEditorSource.indexOf('return {')
  )
  const resetPasswordBody = userAccountActionsSource.slice(
    userAccountActionsSource.indexOf('async function resetPassword'),
    userAccountActionsSource.indexOf('async function removeUser')
  )
  assert.ok(userManagementSource.includes('userCreatePayload(form)'))
  assert.ok(userManagementSource.includes('changedUserUpdatePayload(form, editingOriginal.value)'))
  assert.ok(userManagementSource.includes('userRolePayload(form)'))
  assert.ok(userManagementSource.includes('userSchoolPayload(form)'))
  assert.ok(saveUserBody.includes('api.updateUserRole'))
  assert.ok(saveUserBody.includes('api.updateUserSchool'))
  assert.ok(saveUserBody.includes('upsertUserRows(rows.value, savedUser)'))
  assert.ok(saveUserBody.includes('findUserByPhone(desiredPayload.phone)'))
  assert.ok(userManagementSource.includes('api.fetchUsers({ page: 1, pageSize: 100, phone })'))
  assert.ok(userManagementApiSource.includes('managementApi.listUsers(params)'))
  assert.ok(userManagementSource.includes("find(user => String(user.phone || '') === String(phone))"))
  assert.ok(saveUserBody.includes('existingUserBeforeCreate'))
  assert.ok(saveUserBody.includes('userMatchesPayload(existingUserBeforeCreate, desiredPayload)'))
  assert.ok(saveUserBody.includes('? existingUserBeforeCreate'))
  assert.ok(saveUserBody.includes('recoverSavedUser('))
  assert.ok(userManagementSource.includes('handleAdminActionError(error)'))
  assert.ok(!saveUserBody.includes('await loadData()'))
  assert.ok(!usersSource.includes('v-model="form.password"'))
  assert.ok(!usersSource.includes('v-model="form.childName"'))
  assert.ok(!usersSource.includes('v-model="form.status"'))
  assert.ok(resetPasswordBody.includes("typeof result === 'string'"))
})

test('admin user page does not expose unsupported batch disable missing from 2openap', () => {
  assert.equal(openapi2.paths?.['/api/admin/users/batch-disable'], undefined)
  assert.ok(!usersSource.includes('@click="batchDisable"'))
  assert.ok(!userManagementSource.includes('async function batchDisable'))
  assert.ok(!usersSource.includes('type="selection"'))
  assert.ok(!usersSource.includes('@selection-change'))
})

test('keeps the legacy teacher class assignment payload strict', () => {
  assert.deepEqual(teacherClassesPayload(['1', 2, '', null, '03', 'abc']), { classIds: [1, 2, 3] })
})

test('maps class forms and teacher assignment to the strict 9openapi request bodies', () => {
  const form = {
    name: ' 大一班 ',
    gradeName: ' 大班 ',
    sortOrder: '12',
    schoolId: '8',
    status: 'DISABLED',
    teacherIds: [1]
  }
  assert.deepEqual(classCreatePayload(form), {
    name: '大一班', gradeName: '大班', sortOrder: 12, schoolId: 8
  })
  assert.deepEqual(classUpdatePayload(form), {
    name: '大一班', gradeName: '大班', sortOrder: 12
  })
  assert.deepEqual(classTeachersPayload(['3', 4, '3', '', null, 'invalid']), { teacherIds: [3, 4] })
  assert.deepEqual(
    upsertClassRows([{ id: 1, name: '旧班级', status: 'ACTIVE' }], { id: 1, name: '新班级' }),
    [{ id: 1, name: '新班级', status: 'ACTIVE' }]
  )
  assert.deepEqual(openapi9.components.schemas.PublicClassCreateRequest.required, ['name'])
  assert.deepEqual(openapi9.components.schemas.PublicClassAssignTeachersRequest.required, ['teacherIds'])
  assert.ok(classDirectorySource.includes('classCreatePayload(form)'))
  assert.ok(classDirectorySource.includes('classUpdatePayload(form)'))
  assert.ok(classTeacherAssignmentSource.includes('api.assignClassTeachers('))
  assert.ok(classTeacherAssignmentSource.includes('selectedTeacherIds.value'))
  assert.ok(!bindingsSource.includes('body: form'))
})

test('maps admin news article forms to 3openapi request bodies', () => {
  const form = {
    category: 'legacy text category',
    categoryId: '42',
    title: '  园所新闻  ',
    summary: '  摘要  ',
    coverUrl: '/legacy.png',
    coverFileId: '7',
    content: ' legacy content ',
    contentMarkdown: '  markdown body  ',
    contentHtml: '  <p>html</p>  ',
    author: 'legacy author',
    status: 'PUBLISHED',
    pinned: true,
    isPinned: false,
    sortOrder: '12',
    publishAt: '2026-07-16T10:00:00'
  }
  assert.deepEqual(newsArticlePayload(form), {
    categoryId: 42,
    title: '园所新闻',
    summary: '摘要',
    coverFileId: 7,
    contentMarkdown: 'markdown body',
    contentHtml: '<p>html</p>',
    isPinned: true,
    sortOrder: 12,
    publishAt: '2026-07-16T10:00:00'
  })
  assert.deepEqual(newsPinPayload({ isPinned: false }), { isPinned: false })
  assert.deepEqual(newsSortOrderPayload({ sortOrder: '8' }), { sortOrder: 8 })
  assert.deepEqual(newsArticleCategoryPayload({ categoryId: '3' }), { categoryId: 3 })
  assert.deepEqual(newsSchedulePayload({ publishAt: '2026-07-17T08:30:00' }), { publishAt: '2026-07-17T08:30:00' })
  assert.deepEqual(newsCategoryPayload({ code: ' MUST_NOT_SEND ', name: ' 通知 ', sortOrder: '2' }), { name: '通知', sortOrder: 2 })
  assert.deepEqual(newsCategoryUpdatePayload({ name: ' 动态 ', sortOrder: '6', status: 'DISABLED' }), { name: '动态', sortOrder: 6 })
})

test('normalizes admin news responses from 3openapi', () => {
  assert.deepEqual(
    normalizeNewsArticle({ id: 1, categoryId: 2, categoryName: '通知', createdByName: '管理员', isPinned: true, contentMarkdown: '正文' }),
    {
      id: 1,
      categoryId: 2,
      categoryName: '通知',
      createdByName: '管理员',
      isPinned: true,
      contentMarkdown: '正文',
      category: '通知',
      author: '管理员',
      pinned: true,
      content: '正文'
    }
  )
  assert.deepEqual(
    normalizeNewsCategory({ id: 1, code: 'notice', name: '通知', sortOrder: 3 }),
    { id: 1, code: 'notice', name: '通知', sortOrder: 3, label: '通知', value: 1 }
  )
})

test('matches saved admin news data against submitted 3openapi payloads', () => {
  assert.equal(
    newsArticleMatchesPayload(
      {
        categoryId: 2,
        title: '通知',
        summary: '摘要',
        coverFileId: 7,
        contentMarkdown: '正文',
        contentHtml: '<p>正文</p>',
        isPinned: true,
        sortOrder: 3,
        publishAt: '2026-07-16T10:00:00'
      },
      {
        categoryId: 2,
        title: '通知',
        summary: '摘要',
        coverFileId: 7,
        contentMarkdown: '正文',
        contentHtml: '<p>正文</p>',
        isPinned: true,
        sortOrder: 3,
        publishAt: '2026-07-16 10:00:00'
      }
    ),
    true
  )
  assert.equal(
    newsArticleMatchesPayload({ categoryId: 2, title: '通知', contentMarkdown: '旧正文' }, { categoryId: 2, title: '通知', contentMarkdown: '新正文' }),
    false
  )
  assert.equal(
    newsCategoryMatchesPayload({ code: 'notice', name: '通知', sortOrder: 5 }, { code: 'notice', name: '通知', sortOrder: 5 }),
    true
  )
  assert.equal(
    newsCategoryMatchesPayload({ code: 'notice', name: '旧名称', sortOrder: 5 }, { name: '新名称', sortOrder: 5 }),
    false
  )
})

test('admin news feature follows 3openapi news request rules', () => {
  const saveBody = newsEditorSource.slice(
    newsEditorSource.indexOf('async function saveNews'),
    newsEditorSource.indexOf('return {')
  )
  const saveCategoryBody = newsCategoryManagementSource.slice(
    newsCategoryManagementSource.indexOf('async function saveCategory'),
    newsCategoryManagementSource.indexOf('async function deleteCategory')
  )
  assert.ok(newsManagementApiSource.includes('managementApi.listNewsCategories'))
  assert.ok(newsManagementApiSource.includes('managementApi.listNews'))
  assert.ok(newsManagementSource.includes('newsArticlePayload(form)'))
  assert.ok(newsManagementSource.includes('newsCategoryPayload(categoryForm)'))
  assert.ok(newsManagementSource.includes('newsCategoryUpdatePayload(categoryForm)'))
  assert.ok(saveBody.includes('refreshNewsListAfterSave()'))
  assert.ok(saveCategoryBody.includes('refreshCategoriesAfterSave()'))
  assert.ok(saveBody.includes('recoverSavedNews(payload, editingId.value)'))
  assert.ok(saveCategoryBody.includes('recoverSavedCategory('))
  assert.ok(!saveBody.includes('await loadData()'))
  assert.ok(!saveCategoryBody.includes('await loadCategories()'))
  assert.ok(newsManagementSource.includes('api.changeArticleCategory'))
  assert.ok(newsManagementSource.includes('api.scheduleArticle'))
  assert.ok(newsManagementSource.includes('api.changeArticleSortOrder'))
  assert.ok(newsManagementSource.includes('api.pinArticle'))
  assert.ok(newsManagementSource.includes('newsPinPayload({ isPinned: !row.isPinned })'))
  assert.ok(saveBody.includes('api.createArticle(payload)'))
  assert.ok(saveBody.includes('api.updateArticle(editingId.value, payload)'))
  assert.ok(newsViewSource.includes('v-model="form.categoryId"'))
  assert.ok(newsViewSource.includes('v-model="form.coverFileId"'))
  assert.ok(newsViewSource.includes('v-model="form.contentMarkdown"'))
  assert.ok(!newsViewSource.includes('v-model="form.coverUrl"'))
  assert.ok(!newsViewSource.includes('v-model="form.author"'))
  assert.ok(!newsViewSource.includes('v-model="form.status"'))
  assert.ok(!newsViewSource.includes('v-model="categoryForm.status"'))
  assert.ok(!newsViewSource.includes('v-model="categoryForm.code"'))
  assert.ok(!newsViewSource.includes('请填写分类编码'))
  assert.ok(!newsViewSource.includes("Number(form.categoryId || form.category) || 1"))
})

test('maps admin competition forms to the latest OpenAPI request body', () => {
  const form = {
    title: '  少儿科创赛 ',
    scopeType: ' SCHOOL ',
    schoolId: '7',
    coverFileId: '42',
    summary: '  摘要 ',
    content: '  正文 ',
    infoUrl: ' https://example.com/info ',
    location: ' 南昌 ',
    competitionStartAt: '2026-08-01T09:00:00',
    competitionEndAt: '2026-08-01T12:00:00',
    registrationStartAt: '2026-07-01T00:00:00',
    registrationEndAt: '2026-07-31T23:59:59',
    maxParticipants: '120',
    status: 'PUBLISHED'
  }
  assert.deepEqual(competitionPayload(form), {
    title: '少儿科创赛',
    schoolId: 7,
    scopeType: 'SCHOOL',
    coverFileId: 42,
    summary: '摘要',
    content: '正文',
    infoUrl: 'https://example.com/info',
    location: '南昌',
    competitionStartAt: '2026-08-01T09:00:00',
    competitionEndAt: '2026-08-01T12:00:00',
    registrationStartAt: '2026-07-01T00:00:00',
    registrationEndAt: '2026-07-31T23:59:59',
    maxParticipants: 120
  })
  assert.deepEqual(competitionInfoUrlPayload(form), { infoUrl: 'https://example.com/info' })
  assert.ok(openapi12.components.schemas.AdminCompetitionCreateRequest.properties.schoolId)
  assert.deepEqual(competitionPayload({ title: '平台赛', scopeType: 'PLATFORM' }), {
    title: '平台赛',
    scopeType: 'PLATFORM'
  })
})

test('normalizes and updates admin competition table rows from 2openap responses', () => {
  assert.deepEqual(
    normalizeCompetition({ id: 1, name: '旧字段赛事', registrationCount: 3, maxParticipants: 10 }),
    {
      id: 1,
      name: '旧字段赛事',
      registrationCount: 3,
      maxParticipants: 10,
      title: '旧字段赛事',
      registeredCount: 3,
      scopeType: ''
    }
  )
  assert.deepEqual(
    upsertCompetitionRows([{ id: 1, title: '旧赛事', status: 'DRAFT' }], { id: 1, title: '新赛事', status: 'PUBLISHED' }),
    [{ id: 1, title: '新赛事', status: 'PUBLISHED', registeredCount: 0, maxParticipants: 0, scopeType: '' }]
  )
})

test('matches a saved admin competition response against the submitted 2openap payload', () => {
  assert.equal(
    competitionMatchesPayload(
      {
        title: '少儿科创赛',
        scopeType: 'PLATFORM',
        summary: '摘要',
        content: '正文',
        competitionStartAt: '2026-08-01T09:00:00',
        competitionEndAt: '2026-08-01T12:00:00',
        registrationStartAt: '2026-07-01T00:00:00',
        registrationEndAt: '2026-07-31T23:59:59',
        maxParticipants: 120
      },
      {
        title: '少儿科创赛',
        scopeType: 'PLATFORM',
        summary: '摘要',
        content: '正文',
        competitionStartAt: '2026-08-01 09:00:00',
        competitionEndAt: '2026-08-01 12:00:00',
        registrationStartAt: '2026-07-01 00:00:00',
        registrationEndAt: '2026-07-31 23:59:59',
        maxParticipants: 120
      }
    ),
    true
  )
  assert.equal(
    competitionMatchesPayload(
      { title: '少儿科创赛', registrationEndAt: '2026-07-30T23:59:59' },
      { title: '少儿科创赛', registrationEndAt: '2026-07-31 23:59:59' }
    ),
    false
  )
})

test('admin competition feature follows the current competition request rules', () => {
  const saveBody = competitionEditorSource.slice(
    competitionEditorSource.indexOf('async function saveCompetition'),
    competitionEditorSource.indexOf('return {')
  )
  assert.ok(saveBody.includes('api.createCompetition(payload)'))
  assert.ok(saveBody.includes('api.updateCompetition(editingId.value, payload)'))
  assert.ok(saveBody.includes('competitionPayload(form)'))
  assert.ok(competitionManagementApiSource.includes('managementApi.listSchools(params)'))
  assert.ok(competitionViewSource.includes('v-model="form.scopeType"'))
  assert.ok(competitionViewSource.includes('v-if="form.scopeType === \'SCHOOL\'"'))
  assert.ok(competitionViewSource.includes('v-model="form.schoolId"'))
  assert.ok(competitionViewSource.includes('@change="handleScopeTypeChange"'))
  assert.ok(competitionsSource.includes('openRegistrations(row)'))
  assert.ok(competitionManagementApiSource.includes('managementApi.listCompetitionRegistrations(competitionId, params)'))
  assert.ok(competitionManagementSource.includes('pageSize: registrationPageSize'))
  assert.ok(competitionManagementApiSource.includes('managementApi.updateCompetitionInfoUrl(competitionId, payload)'))
  assert.ok(competitionManagementSource.includes('confirmMessage: `确认发布赛事 ${row.title}？`'))
  assert.ok(competitionManagementSource.includes("errorMessage: '赛事发布失败'"))
  assert.ok(competitionManagementSource.includes("expectedStatus: 'PUBLISHED'"))
  assert.ok(competitionManagementSource.includes('confirmMessage: `确认下线赛事 ${row.title}？`'))
  assert.ok(competitionManagementSource.includes("errorMessage: '赛事下线失败'"))
  assert.ok(competitionManagementSource.includes("expectedStatus: 'OFFLINE'"))
  assert.ok(competitionsSource.includes('v-if="row.status === \'OFFLINE\'"'))
  assert.ok(competitionManagementSource.includes("if (row.status !== 'OFFLINE')"))
  assert.ok(competitionManagementSource.includes('competitionDeleteErrorMessage(error, row)'))
  assert.ok(competitionManagementSource.includes('isCompetitionDialogCancel(error)'))
  assert.ok(competitionManagementSource.includes('recoverCompetitionFromCandidates(payload, candidates)'))
  assert.ok(competitionManagementSource.includes('api.fetchCompetition(candidate.id)'))
  assert.ok(competitionManagementSource.includes('upsertCompetitionRows(rows.value, savedCompetition)'))
  assert.ok(saveBody.includes('recoverSavedCompetition('))
  assert.ok(saveBody.includes('if (savedCompetition) {'))
  assert.equal((competitionViewSource.match(/<el-date-picker/g) || []).length, 4)
  assert.ok(competitionViewSource.includes('type="datetime"'))
  assert.ok(competitionViewSource.includes('value-format="YYYY-MM-DDTHH:mm:ss"'))
  assert.ok(!competitionViewSource.includes('placeholder="YYYY-MM-DD HH:mm:ss"'))
  assert.ok(!competitionViewSource.includes('disabled>新增赛事'))
  assert.ok(!competitionViewSource.includes('disabled>编辑'))
})
