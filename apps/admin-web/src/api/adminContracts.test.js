import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { adminApiContracts } from './adminContracts.js'

const openapi12 = JSON.parse(readFileSync(new URL('../../../../../docs/api/12openapi.json', import.meta.url), 'utf8'))
const adminContractsSource = readFileSync(new URL('./adminContracts.js', import.meta.url), 'utf8')
const adminUserPayloadsSource = readFileSync(new URL('./payloads/userPayloads.js', import.meta.url), 'utf8')
const adminLoginSource = readFileSync(new URL('../views/Login.vue', import.meta.url), 'utf8')
const adminDashboardSource = readFileSync(new URL('../views/Dashboard.vue', import.meta.url), 'utf8')
const adminDashboardModelSource = readFileSync(new URL('../features/admin-dashboard/model/useAdminDashboard.js', import.meta.url), 'utf8')
const adminDashboardViewModelSource = readFileSync(new URL('../features/admin-dashboard/lib/adminDashboardViewModel.js', import.meta.url), 'utf8')
const adminUsersSource = readFileSync(new URL('../views/Users.vue', import.meta.url), 'utf8')
const adminUserManagementApiSource = readFileSync(new URL('../features/user-management/api/userManagementApi.js', import.meta.url), 'utf8')
const adminUserManagementFacadeSource = readFileSync(new URL('../features/user-management/model/useUserManagement.js', import.meta.url), 'utf8')
const adminUserDirectorySource = readFileSync(new URL('../features/user-management/model/useUserDirectory.js', import.meta.url), 'utf8')
const adminUserEditorSource = readFileSync(new URL('../features/user-management/model/useUserEditor.js', import.meta.url), 'utf8')
const adminUserManagementModelSource = [
  adminUserManagementFacadeSource,
  adminUserDirectorySource,
  adminUserEditorSource
].join('\n')
const adminStudentsPageSource = readFileSync(new URL('../views/Students.vue', import.meta.url), 'utf8')
const adminStudentDirectoryPanelSource = readFileSync(new URL('../features/student-management/ui/StudentDirectoryPanel.vue', import.meta.url), 'utf8')
const adminStudentsSource = `${adminStudentsPageSource}\n${adminStudentDirectoryPanelSource}`
const adminStudentManagementApiSource = readFileSync(new URL('../features/student-management/api/studentManagementApi.js', import.meta.url), 'utf8')
const adminStudentDirectoryFacadeSource = readFileSync(new URL('../features/student-management/model/useStudentDirectory.js', import.meta.url), 'utf8')
const adminStudentListSource = readFileSync(new URL('../features/student-management/model/useStudentList.js', import.meta.url), 'utf8')
const adminStudentEditorSource = readFileSync(new URL('../features/student-management/model/useStudentEditor.js', import.meta.url), 'utf8')
const adminStudentDetailActionsSource = readFileSync(new URL('../features/student-management/model/useStudentDetailActions.js', import.meta.url), 'utf8')
const adminStudentDirectorySource = [
  adminStudentDirectoryFacadeSource,
  adminStudentListSource,
  adminStudentEditorSource,
  adminStudentDetailActionsSource
].join('\n')
const adminStudentRelationshipsSource = readFileSync(new URL('../features/student-management/model/useStudentRelationships.js', import.meta.url), 'utf8')
const adminStudentImportSource = readFileSync(new URL('../features/student-management/model/useStudentImport.js', import.meta.url), 'utf8')
const adminStudentViewModelSource = readFileSync(new URL('../features/student-management/lib/studentManagementViewModel.js', import.meta.url), 'utf8')
const adminStudentImportDialogsSource = readFileSync(new URL('../features/student-management/ui/StudentImportDialogs.vue', import.meta.url), 'utf8')
const adminStudentRelationshipDialogsSource = readFileSync(new URL('../features/student-management/ui/StudentRelationshipDialogs.vue', import.meta.url), 'utf8')
const adminStudentRecordDialogsSource = readFileSync(new URL('../features/student-management/ui/StudentRecordDialogs.vue', import.meta.url), 'utf8')
const adminCompetitionsSource = readFileSync(new URL('../views/Competitions.vue', import.meta.url), 'utf8')
const adminCompetitionFormDialogSource = readFileSync(new URL('../features/competition-management/ui/CompetitionFormDialog.vue', import.meta.url), 'utf8')
const adminCompetitionRegistrationDialogSource = readFileSync(new URL('../features/competition-management/ui/CompetitionRegistrationDialog.vue', import.meta.url), 'utf8')
const adminCompetitionViewSource = `${adminCompetitionsSource}\n${adminCompetitionFormDialogSource}\n${adminCompetitionRegistrationDialogSource}`
const adminCompetitionManagementApiSource = readFileSync(new URL('../features/competition-management/api/competitionManagementApi.js', import.meta.url), 'utf8')
const adminCompetitionManagementFacadeSource = readFileSync(new URL('../features/competition-management/model/useCompetitionManagement.js', import.meta.url), 'utf8')
const adminCompetitionDirectorySource = readFileSync(new URL('../features/competition-management/model/useCompetitionDirectory.js', import.meta.url), 'utf8')
const adminCompetitionEditorSource = readFileSync(new URL('../features/competition-management/model/useCompetitionEditor.js', import.meta.url), 'utf8')
const adminCompetitionRegistrationsSource = readFileSync(new URL('../features/competition-management/model/useCompetitionRegistrations.js', import.meta.url), 'utf8')
const adminCompetitionManagementModelSource = [
  adminCompetitionManagementFacadeSource,
  adminCompetitionDirectorySource,
  adminCompetitionEditorSource,
  adminCompetitionRegistrationsSource
].join('\n')
const adminMessagesSource = readFileSync(new URL('../views/Messages.vue', import.meta.url), 'utf8')
const adminMessageBroadcastApiSource = readFileSync(new URL('../features/message-broadcast-management/api/messageBroadcastApi.js', import.meta.url), 'utf8')
const adminMessageBroadcastModelSource = readFileSync(new URL('../features/message-broadcast-management/model/useMessageBroadcastManagement.js', import.meta.url), 'utf8')
const adminNewsSource = readFileSync(new URL('../views/News.vue', import.meta.url), 'utf8')
const adminNewsManagementApiSource = readFileSync(new URL('../features/news-management/api/newsManagementApi.js', import.meta.url), 'utf8')
const adminNewsManagementFacadeSource = readFileSync(new URL('../features/news-management/model/useNewsManagement.js', import.meta.url), 'utf8')
const adminNewsDirectorySource = readFileSync(new URL('../features/news-management/model/useNewsDirectory.js', import.meta.url), 'utf8')
const adminNewsManagementModelSource = `${adminNewsManagementFacadeSource}\n${adminNewsDirectorySource}`
const adminAuditLogsSource = readFileSync(new URL('../views/AuditLogs.vue', import.meta.url), 'utf8')
const adminAuditLogApiSource = readFileSync(new URL('../features/audit-log-management/api/auditLogApi.js', import.meta.url), 'utf8')
const adminAuditLogModelSource = readFileSync(new URL('../features/audit-log-management/model/useAuditLogManagement.js', import.meta.url), 'utf8')
const adminAuditLogViewModelSource = readFileSync(new URL('../features/audit-log-management/lib/auditLogViewModel.js', import.meta.url), 'utf8')
const adminExportTasksSource = readFileSync(new URL('../views/ExportTasks.vue', import.meta.url), 'utf8')
const adminExportTaskViewModelSource = readFileSync(new URL('../features/export-tasks/lib/exportTaskViewModel.js', import.meta.url), 'utf8')
const adminContentReportsSource = readFileSync(new URL('../views/ContentReports.vue', import.meta.url), 'utf8')
const adminContentReportDialogsSource = readFileSync(new URL('../features/content-report-management/ui/ContentReportDialogs.vue', import.meta.url), 'utf8')
const adminContentReportViewSource = `${adminContentReportsSource}\n${adminContentReportDialogsSource}`
const adminContentReportApiSource = readFileSync(new URL('../features/content-report-management/api/contentReportManagementApi.js', import.meta.url), 'utf8')
const adminContentReportViewModelSource = readFileSync(new URL('../features/content-report-management/lib/contentReportViewModel.js', import.meta.url), 'utf8')
const adminLayoutSource = readFileSync(new URL('../views/AdminLayout.vue', import.meta.url), 'utf8')
const adminBindingsSource = readFileSync(new URL('../views/Bindings.vue', import.meta.url), 'utf8')
const adminClassManagementApiSource = readFileSync(new URL('../features/class-management/api/classManagementApi.js', import.meta.url), 'utf8')
const adminClassDirectoryFacadeSource = readFileSync(new URL('../features/class-management/model/useClassDirectory.js', import.meta.url), 'utf8')
const adminClassListSource = readFileSync(new URL('../features/class-management/model/useClassList.js', import.meta.url), 'utf8')
const adminClassActionsSource = readFileSync(new URL('../features/class-management/model/useClassActions.js', import.meta.url), 'utf8')
const adminClassDirectorySource = [
  adminClassDirectoryFacadeSource,
  adminClassListSource,
  adminClassActionsSource
].join('\n')
const adminClassTeacherSource = readFileSync(new URL('../features/class-management/model/useClassTeacherAssignment.js', import.meta.url), 'utf8')
const adminClassStudentSource = readFileSync(new URL('../features/class-management/model/useClassStudentAssignment.js', import.meta.url), 'utf8')
const adminClassViewModelSource = readFileSync(new URL('../features/class-management/lib/classManagementViewModel.js', import.meta.url), 'utf8')
const adminClassRecordDialogsSource = readFileSync(new URL('../features/class-management/ui/ClassRecordDialogs.vue', import.meta.url), 'utf8')
const adminClassStudentDialogsSource = readFileSync(new URL('../features/class-management/ui/ClassStudentDialogs.vue', import.meta.url), 'utf8')
const adminClassViewSource = `${adminBindingsSource}\n${adminClassRecordDialogsSource}\n${adminClassStudentDialogsSource}`
const adminRouterSource = readFileSync(new URL('../app/router/index.js', import.meta.url), 'utf8')
const browserDownloadSource = readFileSync(new URL('../shared/lib/browserDownload.js', import.meta.url), 'utf8')
const adminViewSources = [
  '../views/Dashboard.vue',
  '../views/Students.vue',
  '../views/ContentReports.vue',
  '../views/Bindings.vue',
  '../views/Simulations.vue',
  '../views/Messages.vue'
].map(file => ({
  file,
  source: readFileSync(new URL(file, import.meta.url), 'utf8')
}))

function collectContracts(group, prefix = []) {
  return Object.entries(group).flatMap(([key, value]) => {
    if (value?.method && value?.path) return [{ key: [...prefix, key].join('.'), ...value }]
    if (value && typeof value === 'object') return collectContracts(value, [...prefix, key])
    return []
  })
}

test('covers the super admin modules required by plan A', () => {
  assert.deepEqual(Object.keys(adminApiContracts), [
    'dashboard',
    'schools',
    'users',
    'students',
    'publicSchools',
    'classes',
    'simulations',
    'pages',
    'news',
    'competitions',
    'contentReports',
    'auditLogs',
    'exports',
    'openUsers',
    'messageBroadcasts',
    'openCompetitions',
    'openAuditLogs',
    'openExports'
  ])
})

test('marks only modules still missing from the latest OpenAPI as backend not implemented', () => {
  assert.equal(adminApiContracts.simulations.enter.implemented, false)
  assert.ok(!('path' in adminApiContracts.simulations.enter))
  assert.equal(adminApiContracts.students.list.path, '/api/public/students')
  assert.equal(adminApiContracts.students.create.method, 'POST')
  assert.equal(adminApiContracts.exports.create.method, 'POST')
})

test('keeps implemented admin API contracts aligned with 12openapi.json', () => {
  const implemented = collectContracts(adminApiContracts).filter(contract => contract.implemented !== false)
  assert.ok(implemented.length > 0)
  assert.deepEqual(
    implemented.filter(contract => !openapi12.paths?.[contract.path]?.[contract.method.toLowerCase()]).map(contract => `${contract.method} ${contract.path}`),
    []
  )
  assert.ok(implemented.every(contract => contract.path.startsWith('/api/')))
  assert.equal(adminApiContracts.dashboard.stats.path, '/api/admin/dashboard/stats')
  assert.equal(adminApiContracts.schools.list.path, '/api/admin/schools')
  assert.equal(adminApiContracts.users.update.method, 'PATCH')
  assert.equal(adminApiContracts.users.resetPassword.method, 'POST')
  assert.equal(adminApiContracts.classes.list.path, '/api/public/classes')
  assert.equal(adminApiContracts.classes.create.method, 'POST')
  assert.equal(adminApiContracts.classes.update.method, 'PATCH')
  assert.equal(adminApiContracts.classes.delete.method, 'DELETE')
  assert.equal(adminApiContracts.classes.assignTeachers.path, '/api/public/classes/{id}/teachers')
  assert.equal(adminApiContracts.news.list.path, '/api/admin/news-articles')
  assert.equal(adminApiContracts.news.delete.path, '/api/admin/news-articles/{id}')
  assert.equal(adminApiContracts.news.articleCategory.path, '/api/admin/news-articles/{id}/category')
  assert.equal(adminApiContracts.news.schedule.path, '/api/admin/news-articles/{id}/schedule')
  assert.equal(adminApiContracts.news.updateCategory.path, '/api/admin/news-categories/{id}')
  assert.equal(adminApiContracts.news.deleteCategory.path, '/api/admin/news-categories/{id}')
  assert.equal(adminApiContracts.competitions.infoUrl.path, '/api/admin/competitions/{id}/info-url')
})

test('does not ship admin mock data for visible screens', () => {
  assert.ok(!adminContractsSource.includes('export const adminMock'))
  assert.ok(!adminContractsSource.includes('totalUsers: 2860'))
  assert.ok(!adminContractsSource.includes('SJZ-001'))
  for (const { file, source } of adminViewSources) {
    assert.ok(!source.includes('adminMock'), `${file} should not import or read adminMock`)
    assert.ok(!/\bmock\b/i.test(source), `${file} should not mention mock display data`)
  }
})

test('shows backend-not-implemented copy only for admin modules still missing from OpenAPI', () => {
  const missingModuleViews = adminViewSources.filter(({ file }) => file === '../views/Simulations.vue')
  for (const { file, source } of missingModuleViews) {
    assert.ok(source.includes('后端接口还没写'), `${file} should tell operators the backend API is not written`)
  }
})

test('student supervision uses student operations introduced through 7openapi', () => {
  assert.match(adminStudentManagementApiSource, /managementApi\.listOpenStudents/)
  assert.match(adminStudentManagementApiSource, /managementApi\.createOpenStudent/)
  assert.match(adminStudentManagementApiSource, /managementApi\.getOpenStudent/)
  assert.match(adminStudentManagementApiSource, /managementApi\.updateOpenStudent/)
  assert.match(adminStudentManagementApiSource, /managementApi\.setOpenStudentClass/)
  assert.match(adminStudentManagementApiSource, /managementApi\.enableOpenStudent/)
  assert.match(adminStudentManagementApiSource, /managementApi\.disableOpenStudent/)
  assert.match(adminStudentManagementApiSource, /managementApi\.listOpenStudentGuardians/)
  assert.match(adminStudentManagementApiSource, /managementApi\.bindOpenUserStudents/)
  assert.match(adminStudentManagementApiSource, /managementApi\.unbindOpenStudentGuardian/)
  assert.match(adminStudentManagementApiSource, /managementApi\.getOpenStudentProfile/)
  assert.match(adminStudentManagementApiSource, /managementApi\.listOpenStudentImportBatches/)
  assert.match(adminStudentManagementApiSource, /managementApi\.getOpenStudentImportBatch/)
  assert.match(adminStudentManagementApiSource, /managementApi\.importOpenStudents/)
  assert.match(adminStudentManagementApiSource, /managementApi\.downloadOpenStudentImportTemplate/)
  assert.match(adminStudentImportSource, /student-import-template\.xlsx/)
  assert.match(adminStudentImportSource, /学生导入模板下载成功/)
  assert.match(adminStudentImportSource, /batchesDialogVisible\.value = true/)
  assert.match(adminStudentImportDialogsSource, /导入任务可能异步执行/)
  assert.match(adminStudentManagementApiSource, /createExport\('STUDENTS'/)
  assert.match(adminStudentManagementApiSource, /waitForExport\(createdTask\?\.id\)/)
  assert.match(adminStudentManagementApiSource, /downloadExport\(completedTask\.id\)/)
  assert.doesNotMatch(adminStudentManagementApiSource, /managementApi\.createOpenExportTask/)
  assert.equal(adminApiContracts.exports.download.path, '/api/admin/export-tasks/{id}/download')
  assert.match(adminStudentsSource, /label="手机号"/)
  assert.match(adminStudentRecordDialogsSource, /studentDetail\.phoneNum/)
  assert.match(adminStudentsSource, /row\.phoneNum/)
  assert.match(adminStudentRelationshipsSource, /api\.fetchUser\(guardianUserId\)/)
  assert.match(adminStudentRelationshipsSource, /user\?\.phone/)
  assert.match(adminStudentRelationshipsSource, /guardianPhone: await loadFullGuardianPhone\(guardian\)/)
  assert.match(adminStudentRelationshipsSource, /isFullPhone\(responsePhone\) \? responsePhone : ''/)
  assert.match(adminStudentViewModelSource, /phoneNum: student\.phoneNumber \|\| student\.phoneNum \|\| detail\?\.phoneNumber \|\| detail\?\.phoneNum \|\| ''/)
  assert.match(adminStudentDirectorySource, /phoneNum: detail\.phoneNumber \|\| detail\.phoneNum \|\| row\.phoneNum \|\| ''/)
  assert.doesNotMatch(adminStudentDirectorySource, /guardianSummary\.phoneNum/)
  assert.doesNotMatch(adminStudentViewModelSource, /primaryGuardianPhone/)
  assert.doesNotMatch(adminStudentsSource, /label="绑定码"/)
  assert.doesNotMatch(adminStudentRecordDialogsSource, /studentDetail\.bindCode/)
  assert.doesNotMatch(adminStudentsSource, /row\.bindCode/)
  assert.doesNotMatch(adminStudentsSource, /后端接口还没写/)
  assert.equal(adminApiContracts.openUsers.bindStudents.path, '/api/open/users/{id}/bind-students')
  assert.match(adminStudentsSource, />绑定家长<\/el-button>/)
  assert.match(adminStudentRelationshipsSource, /roleCode: 'PARENT'/)
  assert.match(adminStudentRelationshipDialogsSource, /覆盖式设置/)
  assert.doesNotMatch(adminStudentDirectorySource, /bindCode/)
})

test('student create form follows the latest PublicStudentCreateRequest fields', () => {
  const createSchema = openapi12.components.schemas.PublicStudentCreateRequest
  assert.deepEqual(createSchema.required, ['name', 'phoneNum'])
  assert.equal(createSchema.properties.phoneNum.pattern, '^\\d{11}$')
  assert.ok(!('bindCode' in createSchema.properties))
  assert.match(adminStudentRecordDialogsSource, /updateStudentForm\('phoneNum', value\.trim\(\)\)/)
  assert.match(adminStudentDirectorySource, /\^\\d\{11\}\$/)
  assert.doesNotMatch(adminStudentRecordDialogsSource, /form\.bindCode/)
})

test('student form loads a school-scoped class dropdown', () => {
  assert.match(adminStudentRecordDialogsSource, /@update:model-value="changeStudentSchool"/)
  assert.match(adminStudentRecordDialogsSource, /updateStudentForm\('classId', value\)/)
  assert.match(adminStudentDirectorySource, /api\.fetchClasses\(\{[\s\S]*?schoolId:\s*selectedSchoolId/)
  assert.match(adminStudentDirectorySource, /String\(classItem\.schoolId\) === String\(selectedSchoolId\)/)
  assert.match(adminStudentRecordDialogsSource, /请先选择学校/)
  assert.doesNotMatch(adminStudentRecordDialogsSource, /<el-input-number[\s\S]{0,160}form\.classId/)
})

test('class management consumes all class operations introduced by 9openapi', () => {
  assert.ok(adminLayoutSource.includes("label: '班级管理'"))
  assert.ok(adminBindingsSource.includes('班级管理'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.listClasses(params)'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.getClass(classId)'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.createClass(payload)'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.updateClass(classId, payload)'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.deleteClass(classId)'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.enableClass(classId)'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.disableClass(classId)'))
  assert.ok(adminClassManagementApiSource.includes('managementApi.assignClassTeachers(classId, teacherIds)'))
  assert.ok(adminClassDirectorySource.includes("status: 'ACTIVE'"))
  assert.ok(adminClassViewModelSource.includes("filter(school => school.status === 'ACTIVE')"))
  assert.ok(adminClassTeacherSource.includes("roleCode: 'TEACHER'"))
  assert.ok(adminClassTeacherSource.includes('api.fetchTeacher(teacherRow.id)'))
  assert.ok(adminClassTeacherSource.includes('teacherBelongsToClass(teacher, classRow.id)'))
  assert.ok(adminClassTeacherSource.includes('teacherBelongsToClass(teacher, detail.id)'))
  assert.ok(adminClassViewSource.includes('label="任课教师"'))
  assert.ok(adminBindingsSource.includes('classTeacherNames(row.id)'))
  assert.ok(adminClassDirectorySource.includes('onRowsLoaded(items)'))
  assert.ok(adminClassViewSource.includes('覆盖该班级原有教师'))
  assert.ok(adminClassDirectorySource.includes('执行软删除'))
  assert.ok(!adminBindingsSource.includes('3openapi.json 未定义班级列表'))
  assert.ok(adminBindingsSource.includes('useClassManagement'))
})

test('class student management uses the dedicated 12openapi class endpoint', () => {
  assert.ok(adminClassStudentSource.includes('api.fetchStudents({ page, pageSize: 100 })'))
  assert.ok(adminClassStudentSource.includes('api.fetchStudent(student.id)'))
  assert.ok(adminClassViewModelSource.includes('primaryStudentClass(detail)'))
  assert.ok(adminClassStudentSource.includes('mapWithConcurrency(schoolStudents, loadStudentClassDetail, 5)'))
  assert.ok(adminClassViewModelSource.includes("student.status === 'ACTIVE'"))
  assert.ok(adminClassStudentSource.includes('api.setStudentClass(student.id, activeClass.value.id)'))
  assert.ok(adminClassStudentSource.includes('api.setStudentClass('))
  assert.ok(adminClassStudentSource.includes('transferStudent.value.id'))
  assert.ok(adminClassStudentSource.includes("status: 'ACTIVE'"))
  assert.ok(adminClassViewSource.includes('当前接口不支持将班级置空'))
  assert.ok(adminClassViewSource.includes('选择同校的其他启用班级'))
  assert.ok(!adminClassViewSource.includes('{ classId: null }'))
})

test('does not expose a local admin demo login session', () => {
  assert.ok(!adminLoginSource.includes('demo-admin-token'))
  assert.ok(!adminLoginSource.includes('本地演示登录'))
})

test('renders admin user real names returned by 2openap', () => {
  assert.ok(adminUsersSource.includes('displayName'))
  assert.ok(adminUserManagementModelSource.includes('normalizeAdminUser'))
  assert.ok(adminUserPayloadsSource.includes('displayName: user.realName || user.nickname || user.phone'))
  assert.ok(adminUsersSource.includes('v-model="form.realName"'))
  assert.ok(adminUsersSource.includes('useUserManagement'))
})

test('admin user export waits for completion and downloads through the admin export endpoint', () => {
  assert.match(adminUserManagementApiSource, /createExport\('USERS'/)
  assert.match(adminUserManagementApiSource, /waitForExport\(createdTask\?\.id\)/)
  assert.match(adminUserManagementApiSource, /downloadExport\(completedTask\.id\)/)
  assert.equal(adminApiContracts.exports.download.path, '/api/admin/export-tasks/{id}/download')
})

test('competition export is owned by the competition management feature', () => {
  assert.match(adminCompetitionManagementApiSource, /createExport\('COMPETITIONS'/)
  assert.match(adminCompetitionManagementApiSource, /waitForExport\(createdTask\?\.id\)/)
  assert.match(adminCompetitionManagementApiSource, /downloadExport\(completedTask\.id\)/)
  assert.match(adminCompetitionManagementModelSource, /saveFile\(/)
  assert.match(adminCompetitionsSource, /useCompetitionManagement/)
  assert.match(browserDownloadSource, /anchor\.click\(\)/)
  assert.match(browserDownloadSource, /urlApi\.revokeObjectURL\(objectUrl\)/)
})

test('news export is owned by the news management feature', () => {
  assert.match(adminNewsManagementApiSource, /createExport\('NEWS'/)
  assert.match(adminNewsManagementApiSource, /waitForExport\(createdTask\?\.id\)/)
  assert.match(adminNewsManagementApiSource, /downloadExport\(completedTask\.id\)/)
  assert.match(adminNewsManagementModelSource, /saveFile\(/)
  assert.match(adminNewsSource, /useNewsManagement/)
})

test('message export is owned by the message broadcast feature', () => {
  assert.match(adminMessageBroadcastApiSource, /createExport\('MESSAGES'/)
  assert.match(adminMessageBroadcastApiSource, /waitForExport\(createdTask\?\.id\)/)
  assert.match(adminMessageBroadcastApiSource, /downloadExport\(completedTask\.id\)/)
  assert.match(adminMessageBroadcastModelSource, /saveFile\(/)
  assert.match(adminMessagesSource, /useMessageBroadcastManagement/)
})

test('audit log export uses the supported task type and downloads the completed file', () => {
  assert.match(adminAuditLogApiSource, /createExport\('AUDIT_LOGS'/)
  assert.match(adminAuditLogApiSource, /waitForExport\(createdTask\?\.id\)/)
  assert.match(adminAuditLogApiSource, /downloadExport\(completedTask\.id\)/)
  assert.match(adminAuditLogModelSource, /saveFile\(/)
  assert.doesNotMatch(adminAuditLogApiSource, /createExport\('AUDIT'/)
  assert.match(adminExportTasksSource, /value="AUDIT_LOGS"/)
  assert.match(adminExportTaskViewModelSource, /AUDIT_LOGS: '审计'/)
})

test('audit log actions are always displayed in Chinese', () => {
  assert.match(adminAuditLogViewModelSource, /DOWNLOAD: '下载'/)
  assert.match(adminAuditLogViewModelSource, /UPDATE_STATUS: '更新状态'/)
  assert.match(adminAuditLogViewModelSource, /'DOWNLOAD',[\s\S]*?'HANDLE'/)
  assert.match(adminAuditLogViewModelSource, /row\.action \? '其他操作' : '-'/)
  assert.doesNotMatch(adminAuditLogViewModelSource, /label \|\| row\.action/)
})

test('audit log target types are always displayed in Chinese', () => {
  assert.match(adminAuditLogViewModelSource, /SchoolClass: '班级'/)
  assert.match(adminAuditLogViewModelSource, /value \? '其他对象' : '-'/)
  assert.doesNotMatch(adminAuditLogViewModelSource, /AUDIT_TARGET_TYPE_LABELS\[value\] \|\| value/)
  assert.match(adminAuditLogsSource, /useAuditLogManagement/)
})

test('dashboard counts school administrators from the filtered backend user page', () => {
  assert.ok(adminDashboardViewModelSource.includes('总校方管理员数'))
  assert.ok(adminDashboardModelSource.includes("roleCode: 'SCHOOL_ADMIN'"))
  assert.ok(adminDashboardModelSource.includes('schoolAdminCount.value = dashboardPageTotal(schoolAdminsData)'))
  assert.ok(adminDashboardSource.includes('useAdminDashboard()'))
})

test('admin competition page uses 8openapi registration pagination without the lead-teacher action', () => {
  assert.ok(adminCompetitionManagementModelSource.includes('competitionPayload(form)'))
  assert.ok(adminCompetitionManagementModelSource.includes('api.createCompetition(payload)'))
  assert.ok(adminCompetitionManagementModelSource.includes('api.updateCompetition(editingId.value, payload)'))
  assert.ok(adminCompetitionManagementModelSource.includes('api.fetchCompetitionRegistrations('))
  assert.ok(adminCompetitionManagementModelSource.includes('page: registrationPage.value'))
  assert.ok(adminCompetitionManagementModelSource.includes('pageSize: registrationPageSize'))
  assert.ok(adminCompetitionManagementModelSource.includes('keyword: registrationKeyword.value.trim()'))
  assert.ok(!adminCompetitionManagementModelSource.includes('registrationStatus'))
  assert.ok(adminCompetitionManagementModelSource.includes('registrationRows.value = competitionPageItems(payload)'))
  assert.ok(adminCompetitionViewSource.includes(':total="registrationTotal"'))
  assert.ok(adminCompetitionViewSource.includes('label="学生姓名"'))
  assert.ok(adminCompetitionViewSource.includes('label="班级"'))
  assert.ok(adminCompetitionViewSource.includes('label="家长姓名"'))
  assert.ok(adminCompetitionViewSource.includes('label="家长电话"'))
  assert.ok(!adminCompetitionViewSource.includes('v-for="column in registrationColumns"'))
  assert.ok(!adminCompetitionViewSource.includes('setLeadTeacher'))
  assert.ok(!adminCompetitionViewSource.includes('>带队教师</el-button>'))
  assert.ok(adminCompetitionManagementModelSource.includes('api.fetchParentRegistrations(parentId)'))
  assert.ok(adminCompetitionManagementApiSource.includes('managementApi.updateCompetitionInfoUrl'))
  assert.ok(!adminCompetitionViewSource.includes('type="primary" disabled>新增赛事'))
  assert.ok(!adminCompetitionViewSource.includes('size="small" disabled>编辑'))
})

test('content report management is routed and backed only by the 7openapi endpoints', () => {
  assert.ok(adminLayoutSource.includes("{ path: '/content-reports', label: '内容举报'"))
  assert.ok(adminRouterSource.includes("path: 'content-reports'"))
  assert.ok(adminRouterSource.includes("import('@/views/ContentReports.vue')"))
  assert.match(adminContentReportApiSource, /managementApi\.listContentReports/)
  assert.match(adminContentReportApiSource, /managementApi\.getContentReport/)
  assert.match(adminContentReportApiSource, /managementApi\.handleContentReport/)
  assert.match(adminContentReportApiSource, /managementApi\.listSchools/)
  assert.ok(adminContentReportViewSource.includes('reportSchoolName(reportDetail)'))
  assert.ok(adminContentReportViewModelSource.includes("DELETED: '已删除'"))
  assert.ok(adminContentReportViewModelSource.includes("DELETE: '删除内容'"))
  assert.ok(!adminContentReportViewSource.includes('label="举报 ID"'))
  assert.ok(!adminContentReportViewSource.includes('label="内容 ID"'))
  assert.ok(!adminContentReportViewSource.includes('学校 ID'))
  assert.ok(adminContentReportViewSource.includes('allow-create'))
  assert.ok(adminContentReportViewSource.includes('maxlength="500"'))
})
