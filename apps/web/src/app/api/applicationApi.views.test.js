import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { createApiClient } from './applicationApi.js'

const registerSource = readFileSync(new URL('../../views/Register.vue', import.meta.url), 'utf8')
const registrationModelSource = readFileSync(new URL('../../features/registration/model/useRegistration.js', import.meta.url), 'utf8')
const profileSource = readFileSync(new URL('../../views/Profile.vue', import.meta.url), 'utf8')
const accountManagementModelSource = readFileSync(new URL('../../features/authentication/model/useAccountManagement.js', import.meta.url), 'utf8')
const accountSecurityModelSource = readFileSync(new URL('../../features/authentication/model/useAccountSecurity.js', import.meta.url), 'utf8')
const passwordResetModelSource = readFileSync(new URL('../../features/authentication/model/usePasswordReset.js', import.meta.url), 'utf8')
const profileSettingsModelSource = readFileSync(new URL('../../features/authentication/model/useProfileSettings.js', import.meta.url), 'utf8')
const messageCenterPageSource = readFileSync(new URL('../../views/MessageCenter.vue', import.meta.url), 'utf8')
const messageConversationSidebarSource = readFileSync(new URL('../../features/messaging/ui/MessageConversationSidebar.vue', import.meta.url), 'utf8')
const messageThreadPanelSource = readFileSync(new URL('../../features/messaging/ui/MessageThreadPanel.vue', import.meta.url), 'utf8')
const messageNotificationPanelSource = readFileSync(new URL('../../features/messaging/ui/MessageNotificationPanel.vue', import.meta.url), 'utf8')
const messageSource = [
  messageCenterPageSource,
  messageConversationSidebarSource,
  messageThreadPanelSource,
  messageNotificationPanelSource
].join('\n')
const messageViewModelSource = readFileSync(new URL('../../features/messaging/lib/messageViewModel.js', import.meta.url), 'utf8')
const messageCenterManagementSource = readFileSync(new URL('../../features/messaging/model/useMessageCenterManagement.js', import.meta.url), 'utf8')
const messageCenterSyncModelSource = readFileSync(new URL('../../features/messaging/model/useMessageCenterSync.js', import.meta.url), 'utf8')
const messageNotificationModelSource = readFileSync(new URL('../../features/messaging/model/useMessageNotifications.js', import.meta.url), 'utf8')
const messageDirectoryModelSource = readFileSync(new URL('../../features/messaging/model/useMessageDirectory.js', import.meta.url), 'utf8')
const messageRealtimeModelSource = readFileSync(new URL('../../features/messaging/model/useMessageRealtime.js', import.meta.url), 'utf8')
const messageThreadFacadeSource = readFileSync(new URL('../../features/messaging/model/useMessageThread.js', import.meta.url), 'utf8')
const messageHistoryModelSource = readFileSync(new URL('../../features/messaging/model/useMessageHistory.js', import.meta.url), 'utf8')
const messageComposerModelSource = readFileSync(new URL('../../features/messaging/model/useMessageComposer.js', import.meta.url), 'utf8')
const messageConversationActionsSource = readFileSync(new URL('../../features/messaging/model/useMessageConversationActions.js', import.meta.url), 'utf8')
const messageThreadModelSource = [
  messageThreadFacadeSource,
  messageHistoryModelSource,
  messageComposerModelSource,
  messageConversationActionsSource
].join('\n')
const dashboardSource = readFileSync(new URL('../../views/Dashboard.vue', import.meta.url), 'utf8')
const dashboardModelSource = readFileSync(new URL('../../features/dashboard/model/useDashboard.js', import.meta.url), 'utf8')
const bindingReviewSource = readFileSync(new URL('../../views/BindingReview.vue', import.meta.url), 'utf8')
const competitionSource = readFileSync(new URL('../../views/CompetitionZone.vue', import.meta.url), 'utf8')
const competitionViewModelSource = readFileSync(new URL('../../features/competition/lib/competitionViewModel.js', import.meta.url), 'utf8')
const competitionDirectoryModelSource = readFileSync(new URL('../../features/competition/model/useCompetitionDirectory.js', import.meta.url), 'utf8')
const competitionManagementModelSource = readFileSync(new URL('../../features/competition/model/useCompetitionManagement.js', import.meta.url), 'utf8')
const competitionRegistrationModelSource = readFileSync(new URL('../../features/competition/model/useCompetitionRegistrationManagement.js', import.meta.url), 'utf8')
const competitionSignupModelSource = readFileSync(new URL('../../features/competition/model/useCompetitionSignup.js', import.meta.url), 'utf8')
const myRegistrationsModelSource = readFileSync(new URL('../../features/competition/model/useMyRegistrations.js', import.meta.url), 'utf8')
const activitiesPageSource = readFileSync(new URL('../../views/ChildrenActivities.vue', import.meta.url), 'utf8')
const activityPublishPanelSource = readFileSync(new URL('../../features/activities/ui/ActivityPublishPanel.vue', import.meta.url), 'utf8')
const activityCardSource = readFileSync(new URL('../../features/activities/ui/ActivityCard.vue', import.meta.url), 'utf8')
const activityCommentsPanelSource = readFileSync(new URL('../../features/activities/ui/ActivityCommentsPanel.vue', import.meta.url), 'utf8')
const activitiesSource = [
  activitiesPageSource,
  activityPublishPanelSource,
  activityCardSource,
  activityCommentsPanelSource
].join('\n')
const activityViewModelSource = readFileSync(new URL('../../features/activities/lib/activityViewModel.js', import.meta.url), 'utf8')
const activityManagementModelSource = readFileSync(new URL('../../features/activities/model/useActivityManagement.js', import.meta.url), 'utf8')
const activityCommentModelSource = readFileSync(new URL('../../features/activities/model/useActivityComments.js', import.meta.url), 'utf8')
const activityDirectoryModelSource = readFileSync(new URL('../../features/activities/model/useActivityDirectory.js', import.meta.url), 'utf8')
const activityMutationModelSource = readFileSync(new URL('../../features/activities/model/useActivityMutations.js', import.meta.url), 'utf8')
const activityPublishingModelSource = readFileSync(new URL('../../features/activities/model/useActivityPublishing.js', import.meta.url), 'utf8')
const growthArchiveSource = readFileSync(new URL('../../views/GrowthArchive.vue', import.meta.url), 'utf8')
const growthArchiveViewModelSource = readFileSync(new URL('../../features/growth-archive/lib/growthArchiveViewModel.js', import.meta.url), 'utf8')
const growthArchiveDirectoryModelSource = readFileSync(new URL('../../features/growth-archive/model/useGrowthArchiveDirectory.js', import.meta.url), 'utf8')
const classRosterSource = readFileSync(new URL('../../views/ClassRoster.vue', import.meta.url), 'utf8')
const teacherRosterViewModelSource = readFileSync(new URL('../../features/teacher-roster/lib/teacherRosterViewModel.js', import.meta.url), 'utf8')
const teacherRosterDirectoryModelSource = readFileSync(new URL('../../features/teacher-roster/model/useTeacherRosterDirectory.js', import.meta.url), 'utf8')
const myRegistrationsSource = readFileSync(new URL('../../views/MyRegistrations.vue', import.meta.url), 'utf8')
const studentSwitcherSource = readFileSync(new URL('../../views/StudentSwitcher.vue', import.meta.url), 'utf8')
const studentContextViewModelSource = readFileSync(new URL('../../features/student-context/lib/studentContextViewModel.js', import.meta.url), 'utf8')
const studentBindingModelSource = readFileSync(new URL('../../features/student-context/model/useStudentBinding.js', import.meta.url), 'utf8')
const studentContextManagementSource = readFileSync(new URL('../../features/student-context/model/useStudentContextManagement.js', import.meta.url), 'utf8')
const studentDirectoryModelSource = readFileSync(new URL('../../features/student-context/model/useStudentDirectory.js', import.meta.url), 'utf8')
const schoolRosterPageSource = readFileSync(new URL('../../views/SchoolRoster.vue', import.meta.url), 'utf8')
const schoolRosterRecordDialogSource = readFileSync(new URL('../../features/school-roster/ui/SchoolRosterRecordDialog.vue', import.meta.url), 'utf8')
const schoolRosterTableSource = readFileSync(new URL('../../features/school-roster/ui/SchoolRosterTable.vue', import.meta.url), 'utf8')
const schoolRosterToolbarSource = readFileSync(new URL('../../features/school-roster/ui/SchoolRosterToolbar.vue', import.meta.url), 'utf8')
const studentGuardianDialogsSource = readFileSync(new URL('../../features/school-roster/ui/StudentGuardianDialogs.vue', import.meta.url), 'utf8')
const studentProfileDialogSource = readFileSync(new URL('../../features/school-roster/ui/StudentProfileDialog.vue', import.meta.url), 'utf8')
const studentImportDialogSource = readFileSync(new URL('../../features/school-roster/ui/StudentImportDialog.vue', import.meta.url), 'utf8')
const schoolRosterSource = [
  schoolRosterPageSource,
  schoolRosterRecordDialogSource,
  schoolRosterTableSource,
  schoolRosterToolbarSource,
  studentGuardianDialogsSource,
  studentProfileDialogSource,
  studentImportDialogSource
].join('\n')
const rosterModelSource = readFileSync(new URL('../../features/school-roster/lib/rosterModel.js', import.meta.url), 'utf8')
const guardianManagementSource = readFileSync(new URL('../../features/school-roster/model/useGuardianManagement.js', import.meta.url), 'utf8')
const rosterDirectoryModelSource = readFileSync(new URL('../../features/school-roster/model/useRosterDirectory.js', import.meta.url), 'utf8')
const rosterRecordModelSource = readFileSync(new URL('../../features/school-roster/model/useRosterRecordManagement.js', import.meta.url), 'utf8')
const rosterStudentProfileModelSource = readFileSync(new URL('../../features/school-roster/model/useRosterStudentProfile.js', import.meta.url), 'utf8')
const rosterTransferModelSource = readFileSync(new URL('../../features/school-roster/model/useStudentRosterTransfers.js', import.meta.url), 'utf8')
const schoolRosterManagementSource = readFileSync(new URL('../../features/school-roster/model/useSchoolRosterManagement.js', import.meta.url), 'utf8')
const schoolClassesPageSource = readFileSync(new URL('../../views/SchoolClasses.vue', import.meta.url), 'utf8')
const schoolClassFormDialogSource = readFileSync(new URL('../../features/school-administration/ui/SchoolClassFormDialog.vue', import.meta.url), 'utf8')
const classTeacherAssignmentDialogSource = readFileSync(new URL('../../features/school-administration/ui/ClassTeacherAssignmentDialog.vue', import.meta.url), 'utf8')
const classStudentAssignmentDialogSource = readFileSync(new URL('../../features/school-administration/ui/ClassStudentAssignmentDialog.vue', import.meta.url), 'utf8')
const schoolClassesSource = [
  schoolClassesPageSource,
  schoolClassFormDialogSource,
  classTeacherAssignmentDialogSource,
  classStudentAssignmentDialogSource
].join('\n')
const classDirectoryModelSource = readFileSync(new URL('../../features/school-administration/model/useClassDirectory.js', import.meta.url), 'utf8')
const classMembershipFacadeSource = readFileSync(new URL('../../features/school-administration/model/useClassMembership.js', import.meta.url), 'utf8')
const classTeacherMembershipSource = readFileSync(new URL('../../features/school-administration/model/useClassTeacherMembership.js', import.meta.url), 'utf8')
const classStudentMembershipSource = readFileSync(new URL('../../features/school-administration/model/useClassStudentMembership.js', import.meta.url), 'utf8')
const classMembershipModelSource = [
  classMembershipFacadeSource,
  classTeacherMembershipSource,
  classStudentMembershipSource
].join('\n')
const schoolClassManagementSource = readFileSync(new URL('../../features/school-administration/model/useSchoolClassManagement.js', import.meta.url), 'utf8')
const openOperationsSource = readFileSync(new URL('../../views/OpenOperations.vue', import.meta.url), 'utf8')
const operationsViewModelSource = readFileSync(new URL('../../features/operations/lib/operationsViewModel.js', import.meta.url), 'utf8')
const operationsDirectoryModelSource = readFileSync(new URL('../../features/operations/model/useOperationsDirectory.js', import.meta.url), 'utf8')
const operationsManagementModelSource = readFileSync(new URL('../../features/operations/model/useOperationsManagement.js', import.meta.url), 'utf8')
const operationsTasksModelSource = readFileSync(new URL('../../features/operations/model/useOperationsTasks.js', import.meta.url), 'utf8')
const parentForumPageSource = readFileSync(new URL('../../views/ParentForum.vue', import.meta.url), 'utf8')
const forumTopicComposerSource = readFileSync(new URL('../../features/forum/ui/ForumTopicComposer.vue', import.meta.url), 'utf8')
const forumTopicCardSource = readFileSync(new URL('../../features/forum/ui/ForumTopicCard.vue', import.meta.url), 'utf8')
const forumReplyThreadSource = readFileSync(new URL('../../features/forum/ui/ForumReplyThread.vue', import.meta.url), 'utf8')
const parentForumSource = [
  parentForumPageSource,
  forumTopicComposerSource,
  forumTopicCardSource,
  forumReplyThreadSource
].join('\n')
const forumViewModelSource = readFileSync(new URL('../../features/forum/lib/forumViewModel.js', import.meta.url), 'utf8')
const forumManagementModelSource = readFileSync(new URL('../../features/forum/model/useForumManagement.js', import.meta.url), 'utf8')
const forumDirectoryModelSource = readFileSync(new URL('../../features/forum/model/useForumDirectory.js', import.meta.url), 'utf8')
const forumInteractionModelSource = readFileSync(new URL('../../features/forum/model/useForumInteractions.js', import.meta.url), 'utf8')
const forumReplyFacadeSource = readFileSync(new URL('../../features/forum/model/useForumReplies.js', import.meta.url), 'utf8')
const forumReplyDirectorySource = readFileSync(new URL('../../features/forum/model/useForumReplyDirectory.js', import.meta.url), 'utf8')
const forumReplyComposerSource = readFileSync(new URL('../../features/forum/model/useForumReplyComposer.js', import.meta.url), 'utf8')
const forumReplyMutationsSource = readFileSync(new URL('../../features/forum/model/useForumReplyMutations.js', import.meta.url), 'utf8')
const forumReplyModelSource = [
  forumReplyFacadeSource,
  forumReplyDirectorySource,
  forumReplyComposerSource,
  forumReplyMutationsSource
].join('\n')
const forumTopicModelSource = readFileSync(new URL('../../features/forum/model/useForumTopicManagement.js', import.meta.url), 'utf8')
const fileUploaderSource = readFileSync(new URL('../../components/AppFileUploader.vue', import.meta.url), 'utf8')
const mediaGallerySource = readFileSync(new URL('../../components/AppMediaGallery.vue', import.meta.url), 'utf8')
const newsInfoSource = readFileSync(new URL('../../views/NewsInfo.vue', import.meta.url), 'utf8')
const newsDirectoryModelSource = readFileSync(new URL('../../features/content/model/useNewsDirectory.js', import.meta.url), 'utf8')
const currentStudentSource = readFileSync(new URL('../../features/student-context/model/currentStudent.js', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../../App.vue', import.meta.url), 'utf8')
const navbarSource = readFileSync(new URL('../../components/Navbar.vue', import.meta.url), 'utf8')
const routerSource = readFileSync(new URL('../router/index.js', import.meta.url), 'utf8')
const loginSource = readFileSync(new URL('../../views/Login.vue', import.meta.url), 'utf8')
const loginModelSource = readFileSync(new URL('../../features/authentication/model/useLogin.js', import.meta.url), 'utf8')
const resetPasswordSource = readFileSync(new URL('../../views/ResetPassword.vue', import.meta.url), 'utf8')
const openapi4 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/4openapi.json', import.meta.url), 'utf8'))
const openapi5 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/5openapi.json', import.meta.url), 'utf8'))
const openapi8 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/8openapi.json', import.meta.url), 'utf8'))
const openapi12 = JSON.parse(readFileSync(new URL('../../../../../../docs/api/12openapi.json', import.meta.url), 'utf8'))

test('marks web register bind code as optional', () => {
  assert.match(registerSource, /绑定码（选填）/)
  assert.doesNotMatch(registerSource, /v-model="form\.bindCode"[^>]*required/)
})

test('register loads public schools and submits the selected school id', () => {
  assert.match(registerSource, /useRegistration/)
  assert.match(registrationModelSource, /schoolApi\.fetchPublicSchools\(\{ page: 1, pageSize: 100 \}\)/)
  assert.match(registerSource, /v-model\.number="form\.schoolId"/)
  assert.match(registerSource, /v-for="school in schoolOptions"/)
  assert.match(registerSource, /:value="school\.id"/)
  assert.match(registrationModelSource, /请选择学校/)
  assert.match(registrationModelSource, /schoolId: ''/)
  assert.doesNotMatch(registerSource, /学校 ID/)
  assert.doesNotMatch(registerSource, /请输入后端学校 ID/)
})

test('profile page exposes current-user password changes and SMS password reset', () => {
  assert.match(profileSource, /useAccountManagement/)
  assert.match(accountManagementModelSource, /useProfileSettings/)
  assert.match(accountManagementModelSource, /useAccountSecurity/)
  assert.match(profileSource, /profile-sidebar/)
  assert.match(profileSource, /profile-nav/)
  assert.match(profileSource, /profile-panel/)
  assert.match(profileSource, /activeTab === 'profile'/)
  assert.match(profileSource, /activeTab === 'password'/)
  assert.match(profileSource, /修改本人密码/)
  assert.match(profileSource, /oldPassword/)
  assert.match(profileSource, /newPassword/)
  assert.match(profileSource, /confirmPassword/)
  assert.match(accountSecurityModelSource, /api\.changePassword/)
  assert.match(profileSource, />忘记密码</)
  assert.match(accountSecurityModelSource, /usePasswordReset/)
  assert.match(passwordResetModelSource, /scene: 'RESET_PASSWORD'/)
  assert.match(passwordResetModelSource, /api\.resetPassword\(\{/)
  assert.match(passwordResetModelSource, /phone: form\.phone/)
  assert.match(passwordResetModelSource, /smsCode: form\.smsCode/)
  assert.match(passwordResetModelSource, /newPassword: form\.newPassword/)
  assert.match(profileSource, /passwordReset: 'success'/)
})

test('login page links to the public SMS password reset flow', () => {
  assert.match(loginSource, /useLogin/)
  assert.match(loginModelSource, /auth\.loginWithPassword/)
  assert.match(loginModelSource, /auth\.loginWithPhone/)
  assert.match(loginModelSource, /auth\.sendSMSCode/)
  assert.match(loginSource, /path: '\/reset-password'/)
  assert.match(loginSource, />忘记密码<\/router-link>/)
  assert.match(loginSource, /还没有账号？<router-link to="\/register">立即注册<\/router-link>/)
  assert.match(routerSource, /path: '\/reset-password'/)
  assert.match(resetPasswordSource, /usePasswordReset/)
  assert.match(passwordResetModelSource, /scene: 'RESET_PASSWORD'/)
  assert.match(passwordResetModelSource, /api\.resetPassword\(\{/)
  assert.match(passwordResetModelSource, /phone: form\.phone/)
  assert.match(passwordResetModelSource, /smsCode: form\.smsCode/)
  assert.match(passwordResetModelSource, /newPassword: form\.newPassword/)
  assert.match(resetPasswordSource, /passwordReset: 'success'/)
})

test('legacy registration summary uses the role-aware competition screen', () => {
  assert.match(
    routerSource,
    /\{ path: '\/registration-summary', redirect: '\/competitions' \}/
  )
  assert.doesNotMatch(routerSource, /views\/RegistrationSummary\.vue/)
})

test('message center uses every user-facing message endpoint from 5openapi', () => {
  assert.ok(openapi5.paths['/api/app/messages/contacts']?.get)
  assert.ok(openapi5.paths['/api/app/messages/conversations']?.get)
  assert.ok(openapi5.paths['/api/app/messages/conversations/{conversationId}/messages']?.get)
  assert.ok(openapi5.paths['/api/app/messages']?.post)
  assert.ok(openapi5.paths['/api/app/messages/{messageId}/read']?.patch)
  assert.ok(openapi5.paths['/api/app/messages/conversations/{conversationId}/read']?.patch)
  assert.ok(openapi5.paths['/api/app/messages/{messageId}/recall']?.patch)
  assert.ok(openapi5.paths['/api/app/messages/{messageId}']?.delete)
  assert.ok(openapi5.paths['/api/app/messages/conversations/{conversationId}/settings']?.patch)
  assert.ok(openapi5.paths['/api/app/messages/unread-count']?.get)
  assert.match(messageSource, /conversation-list/)
  assert.match(messageSource, /conversation-panel/)
  assert.match(messageDirectoryModelSource, /api\.fetchMessageContacts/)
  assert.match(messageDirectoryModelSource, /api\.fetchConversations/)
  assert.match(messageSource, /useMessageCenterManagement/)
  assert.match(messageCenterManagementSource, /createDirectory/)
  assert.match(messageCenterManagementSource, /createThread/)
  assert.match(messageThreadModelSource, /api\.fetchMessageHistory/)
  assert.match(messageThreadModelSource, /api\.markConversationRead/)
  assert.match(messageThreadModelSource, /api\.sendMessage/)
  assert.match(messageThreadModelSource, /api\.recallMessage/)
  assert.match(messageThreadModelSource, /api\.hideMessage/)
  assert.match(messageThreadModelSource, /api\.updateConversationSettings/)
  assert.match(messageDirectoryModelSource, /api\.fetchUnreadCount/)
  assert.match(messageCenterManagementSource, /createNotifications/)
  assert.match(messageNotificationModelSource, /api\.fetchNotifications/)
  assert.match(messageNotificationModelSource, /api\.fetchNotificationUnreadCount/)
  assert.match(messageNotificationModelSource, /api\.markNotificationRead/)
  assert.match(messageNotificationModelSource, /api\.markAllNotificationsRead/)
  assert.match(messageDirectoryModelSource, /splitMessageConversations\(items\)/)
  assert.match(messageNotificationModelSource, /adminMessageNotification\(message, conversation\)/)
  assert.match(messageNotificationModelSource, /api\.markMessageRead\(notification\.messageId\)/)
  assert.match(messageDirectoryModelSource, /items\.filter\(contact => !isSuperAdminContact\(contact\)\)/)
  assert.match(messageViewModelSource, /ADMIN_BROADCAST: '平台通知'/)
  assert.match(messageCenterSyncModelSource, /setupLiveRefresh\(/)
  assert.match(messageCenterSyncModelSource, /\{ interval: 3000 \}/)
  assert.match(messageCenterSyncModelSource, /createRealtime\(/)
  assert.match(messageCenterManagementSource, /createSync/)
  assert.match(messageRealtimeModelSource, /createDefaultMessageRealtimeClient/)
  assert.match(messageCenterSyncModelSource, /onEvent: applyPushedMessage/)
  assert.match(messageCenterSyncModelSource, /if \(!force && realtime\.realtimeStatus\.value === 'connected'\) return false/)
  assert.match(messageRealtimeModelSource, /client\?\.deactivate\(\)/)
  assert.match(messageCenterSyncModelSource, /loadMessages\(\{ silent: true \}\)/)
  assert.match(messageCenterSyncModelSource, /loadConversations\(\{ silent: true \}\)/)
  assert.match(messageViewModelSource, /COMPETITION_PUBLISHED: '赛事发布'/)
  assert.match(messageSource, /getCurrentStudent/)
  assert.match(messageViewModelSource, /return \[schoolName, roles\]\.filter\(Boolean\)\.join\('·'\) \|\| '联系人'/)
  assert.doesNotMatch(messageSource, /platformMock/)
  assert.doesNotMatch(messageSource, /mockConversations/)
  assert.doesNotMatch(messageSource, /teacherParentConversations/)
  assert.doesNotMatch(messageSource, /messagesByConversation/)
})

test('growth archive and registration pages use current app OpenAPI endpoints', () => {
  assert.match(growthArchiveSource, /useGrowthArchiveDirectory/)
  assert.match(growthArchiveDirectoryModelSource, /studentsApi\.fetchGrowthRecords/)
  assert.match(growthArchiveDirectoryModelSource, /schoolApi\.getOpenStudentProfile/)
  assert.match(growthArchiveDirectoryModelSource, /studentsApi\.fetchStudents\(\)/)
  assert.match(growthArchiveDirectoryModelSource, /schoolApi\.listOpenStudents/)
  assert.match(growthArchiveSource, /v-model="selectedStudentId"/)
  assert.match(growthArchiveSource, /filterable/)
  assert.match(growthArchiveSource, /v-for="student in studentOptions"/)
  assert.match(growthArchiveSource, /@change="loadRecords"/)
  assert.doesNotMatch(growthArchiveSource, /<input[^>]+selectedStudentId/)
  assert.match(growthArchiveViewModelSource, /MOMENT: '幼儿动态'/)
  assert.match(growthArchiveViewModelSource, /COMPETITION: '赛事'/)
  assert.match(growthArchiveSource, /<router-link v-if="record\.sourceTo"/)
  assert.match(growthArchiveViewModelSource, /query: \{ momentId: sourceId \}/)
  assert.match(growthArchiveViewModelSource, /query: \{ competitionId: sourceId \}/)
  assert.match(activitiesSource, /route\.query\.momentId/)
  assert.match(activityDirectoryModelSource, /api\.fetchActivityDetail\(momentId\)/)
  assert.match(competitionSource, /route\.query\.competitionId/)
  assert.match(competitionSource, /useCompetitionManagement/)
  assert.match(competitionManagementModelSource, /useCompetitionDirectory/)
  assert.match(competitionManagementModelSource, /useCompetitionSignup/)
  assert.match(competitionDirectoryModelSource, /api\.fetchCompetitionDetail\(competitionId\)/)
  assert.doesNotMatch(growthArchiveSource, /platformMock\.growthRecords/)
  assert.match(myRegistrationsSource, /useMyRegistrations/)
  assert.match(myRegistrationsModelSource, /api\.fetchRegistrations/)
  assert.doesNotMatch(myRegistrationsSource, /filter\(r => r\.userId/)
  assert.match(myRegistrationsSource, /registrationId/)
  assert.match(myRegistrationsSource, /competitionTitle/)
})

test('student switcher renders bound children and supports current-student context switching', () => {
  assert.match(studentDirectoryModelSource, /api\.fetchStudents/)
  assert.match(studentDirectoryModelSource, /api\.fetchGuardianBindings/)
  assert.match(studentBindingModelSource, /api\.bindGuardian/)
  assert.match(studentDirectoryModelSource, /api\.switchCurrentStudent/)
  assert.match(studentBindingModelSource, /api\.unbindGuardian/)
  assert.match(studentContextViewModelSource, /export function guardianBindingToStudent/)
  assert.match(studentSwitcherSource, /relationLabel/)
  assert.match(studentSwitcherSource, /bindStatusLabel/)
  assert.match(studentContextViewModelSource, /ACTIVE_STUDENT_BINDING_STATUSES = new Set\(\[/)
  assert.match(studentContextViewModelSource, /\.filter\(isActiveStudentBinding\)/)
  assert.match(studentSwitcherSource, /student\.bindingId && isActiveBinding\(student\)/)
  assert.match(studentBindingModelSource, /!student\.bindingId/)
  assert.match(studentBindingModelSource, /!isActiveStudentBinding\(student\)/)
  assert.match(studentSwitcherSource, /student\.studentNo/)
  assert.match(studentSwitcherSource, /student\.birthday/)
  assert.match(studentSwitcherSource, /学生信息/)
  assert.match(studentSwitcherSource, /当前查看/)
  assert.match(studentSwitcherSource, /useStudentContextManagement/)
  assert.match(studentContextManagementSource, /useStudentDirectory/)
  assert.match(studentDirectoryModelSource, /const students = ref\(\[\]\)/)
  assert.match(studentDirectoryModelSource, /const loading = ref\(true\)/)
  assert.match(studentDirectoryModelSource, /removeCurrentStudent/)
  assert.match(studentDirectoryModelSource, /const studentRequest = api\.fetchStudents/)
  assert.match(studentDirectoryModelSource, /const bindingRequest = api\.fetchGuardianBindings/)
  assert.match(studentDirectoryModelSource, /applyStudentPayloads\(await Promise\.all\(\[studentRequest, bindingRequest\]\)\)/)
  assert.match(studentDirectoryModelSource, /students\.value = mergeBoundStudents/)
  assert.match(studentSwitcherSource, /绑定学生/)
  assert.ok(studentSwitcherSource.indexOf('class="page-heading-row"') < studentSwitcherSource.indexOf('v-if="loading"'))
  assert.ok(studentSwitcherSource.indexOf('>绑定学生<') < studentSwitcherSource.indexOf('v-if="loading"'))
  assert.match(studentContextManagementSource, /useStudentBinding/)
  assert.match(studentBindingModelSource, /schoolApi\.fetchPublicSchools\(\{ page: 1, pageSize: 100 \}\)/)
  assert.match(studentSwitcherSource, /v-for="school in schoolOptions"/)
  assert.match(studentSwitcherSource, /:label="school\.name"/)
  assert.match(studentSwitcherSource, /:value="school\.id"/)
  assert.doesNotMatch(studentSwitcherSource, /label="学校 ID"/)
  assert.doesNotMatch(studentSwitcherSource, /请输入学校 ID/)
  assert.match(studentBindingModelSource, /async function openBindDialog/)
  assert.match(studentBindingModelSource, /async function submitBinding/)
  assert.match(studentBindingModelSource, /studentName: bindForm\.studentName\.trim\(\)/)
  assert.match(studentBindingModelSource, /bindCode: bindForm\.bindCode\.trim\(\)/)
  assert.match(studentBindingModelSource, /relationType: bindForm\.relationType/)
  for (const relationType of [
    'FATHER', 'MOTHER', 'GRANDFATHER_PATERNAL', 'GRANDMOTHER_PATERNAL',
    'GRANDFATHER_MATERNAL', 'GRANDMOTHER_MATERNAL'
  ]) {
    assert.match(studentContextViewModelSource, new RegExp(`${relationType}:`))
  }
  assert.match(studentContextViewModelSource, /STUDENT_RELATION_OPTIONS = Object\.entries\(relationLabels\)/)
  assert.match(registerSource, /v-for="option in relationOptions"/)
  assert.doesNotMatch(studentSwitcherSource, /fallbackStudents/)
  assert.doesNotMatch(studentSwitcherSource, /platformMock/)
  assert.doesNotMatch(studentSwitcherSource, /listStudentsForUser/)
  assert.doesNotMatch(studentSwitcherSource, /catch\(\(\) => \[\]\)/)
  assert.doesNotMatch(studentSwitcherSource, /merged\.length \? merged :/)
  assert.doesNotMatch(studentSwitcherSource, /withFallbackTimeout|REMOTE_STUDENT_LOAD_TIMEOUT/)
})

test('guardian binding uses the required 8openapi request fields', async () => {
  const calls = []
  const api = createApiClient({
    post(path, data) {
      calls.push({ path, data })
      return Promise.resolve({ bindStatus: 'APPROVED' })
    }
  })

  await api.bindGuardian({
    schoolId: '2',
    studentName: '张小明',
    studentNo: '',
    birthday: '',
    bindCode: 'BIND-2026',
    relationType: '妈妈'
  })

  assert.deepEqual(openapi8.components.schemas.BindStudentRequest.required, [
    'schoolId',
    'studentName',
    'bindCode',
    'relationType'
  ])
  assert.deepEqual(calls, [{
    path: '/api/app/guardians/bind',
    data: {
      schoolId: 2,
      studentName: '张小明',
      bindCode: 'BIND-2026',
      relationType: 'MOTHER'
    }
  }])
})

test('maps all six backend-supported guardian relation labels', async () => {
  const relationCalls = []
  const api = createApiClient({
    post(path, data) {
      relationCalls.push({ path, data })
      return Promise.resolve({ bindStatus: 'APPROVED' })
    }
  })
  const relations = [
    ['父亲', 'FATHER'],
    ['母亲', 'MOTHER'],
    ['爷爷', 'GRANDFATHER_PATERNAL'],
    ['奶奶', 'GRANDMOTHER_PATERNAL'],
    ['外公', 'GRANDFATHER_MATERNAL'],
    ['外婆', 'GRANDMOTHER_MATERNAL']
  ]

  for (const [relationType] of relations) {
    await api.bindGuardian({ schoolId: 2, studentName: '张小明', bindCode: 'BIND-2026', relationType })
  }

  assert.deepEqual(relationCalls.map(call => call.data.relationType), relations.map(([, value]) => value))
})

test('school student roster uses the public student API and dedicated class assignment', () => {
  assert.match(schoolRosterSource, /useSchoolRosterManagement/)
  assert.match(schoolRosterManagementSource, /createDirectory/)
  assert.match(rosterDirectoryModelSource, /api\.listOpenStudents/)
  assert.match(schoolRosterManagementSource, /createRecordManagement/)
  assert.match(rosterRecordModelSource, /api\.createOpenStudent/)
  assert.match(rosterDirectoryModelSource, /api\.getOpenStudent/)
  assert.match(rosterRecordModelSource, /api\.updateOpenStudent/)
  assert.match(rosterRecordModelSource, /api\.setOpenStudentClass/)
  assert.match(schoolRosterSource, /v-model\.trim="studentForm\.phoneNum"/)
  assert.doesNotMatch(schoolRosterSource, /v-model\.trim="studentForm\.bindCode"/)
  assert.match(rosterRecordModelSource, /api\.enableOpenStudent/)
  assert.match(rosterRecordModelSource, /api\.disableOpenStudent/)
  assert.match(schoolRosterManagementSource, /createGuardianManagement/)
  assert.match(guardianManagementSource, /api\.listOpenStudentGuardians/)
  assert.match(guardianManagementSource, /api\.getOpenUser\(guardianUserId\)/)
  assert.match(guardianManagementSource, /api\.bindOpenUserStudents/)
  assert.match(schoolRosterSource, /接口采用覆盖式设置/)
  assert.match(schoolRosterSource, /\+ 绑定家长/)
  assert.match(guardianManagementSource, /api\.unbindOpenStudentGuardian/)
  assert.match(schoolRosterSource, /guardianRelationLabels/)
  assert.match(schoolRosterManagementSource, /createStudentProfile/)
  assert.match(rosterStudentProfileModelSource, /api\.getOpenStudentProfile/)
  assert.match(schoolRosterManagementSource, /createRosterTransfers/)
  assert.match(rosterTransferModelSource, /api\.listOpenStudentImportBatches/)
  assert.match(rosterTransferModelSource, /api\.downloadOpenStudentImportTemplate/)
  assert.match(rosterTransferModelSource, /api\.importOpenStudents/)
  assert.doesNotMatch(schoolRosterSource, /学校 ID（可选）/)
  assert.doesNotMatch(schoolRosterSource, /studentImportForm\.schoolId/)
  assert.doesNotMatch(schoolRosterSource, /JSON\.stringify\(importBatchDetail/)
  assert.doesNotMatch(schoolRosterSource, /class="batch-detail"/)
  assert.match(schoolRosterSource, /student\.id/)
  assert.match(schoolRosterSource, /student\.studentNo/)
  assert.doesNotMatch(schoolRosterSource, /student\.bindCode/)
  assert.match(schoolRosterSource, /student\.enrollmentStatus/)
  assert.match(rosterDirectoryModelSource, /mapWithConcurrency\(scopedRows, item => loadStudentRosterRow\(item, currentSchoolId\), 4\)/)
  assert.match(rosterDirectoryModelSource, /schoolId: currentSchoolId/)
  assert.match(rosterModelSource, /primaryStudentClass\(detail(?: \|\| \{\})?\)/)
  assert.match(rosterModelSource, /student\.guardiansCount/)
  assert.doesNotMatch(rosterDirectoryModelSource, /listOpenStudentGuardians/)
  assert.match(schoolRosterSource, /class="data-table student-table"/)
  assert.doesNotMatch(schoolRosterSource, /class="binding-meta"/)
  assert.match(schoolRosterSource, /class="class-tag"/)
  assert.doesNotMatch(schoolRosterSource, /platformMock\.students/)
})

test('school student form selects a class from the current school', () => {
  assert.match(schoolRosterSource, /v-model="studentForm\.classId"/)
  assert.match(rosterRecordModelSource, /api\.fetchPublicClasses\(\{\s*schoolId:\s*currentSchoolId/)
  assert.match(rosterModelSource, /String\(classItem\.schoolId\) === String\(schoolId\)/)
  assert.match(rosterRecordModelSource, /await loadClassOptions\(detail\.schoolId \|\| student\.schoolId\)/)
  assert.match(schoolRosterSource, /暂不分班/)
  assert.doesNotMatch(schoolRosterSource, /班级 ID<input[^>]*studentForm\.classId/)
})

test('school student search treats the shared name and student number field as alternatives', () => {
  assert.match(schoolRosterSource, /@keyup\.enter="\$emit\('search'\)"/)
  assert.match(schoolRosterSource, /@search="submitSearch"/)
  assert.match(rosterDirectoryModelSource, /async function searchStudentRows\(params\)/)
  assert.match(rosterModelSource, /\/\\d\/\.test\(String\(keyword\)\) \? \['studentNo', 'name'\] : \['name', 'studentNo'\]/)
  assert.match(rosterDirectoryModelSource, /listOpenStudents\(\{ \.\.\.params, \[filter\]: search \}\)/)
  assert.match(rosterDirectoryModelSource, /emptyPayload \|\|= payload/)
  assert.match(rosterDirectoryModelSource, /firstError \|\|= error/)
  assert.match(rosterDirectoryModelSource, /page\.value = 1\s+return loadRows\(\)/)
  assert.doesNotMatch(schoolRosterSource, /name: keyword\.value[\s\S]{0,120}studentNo: keyword\.value/)
})

test('school teacher form and filters select concrete school classes instead of class ids', () => {
  assert.match(schoolRosterSource, /v-if="mode === 'teachers'"[\s\S]{0,180}v-model="classIdFilter"/)
  assert.match(schoolRosterSource, /<option value="">全部班级<\/option>/)
  assert.match(schoolRosterSource, /v-model="userForm\.classIds"\s+multiple/)
  assert.match(schoolRosterSource, /placeholder="选择本校班级"/)
  assert.match(rosterRecordModelSource, /await loadClassOptions\(detail\.schoolId \|\| account\.schoolId\)/)
  assert.doesNotMatch(schoolRosterSource, /所带班级 ID|多个 ID 用逗号分隔/)
})

test('school administrator pages never render static business records', () => {
  assert.doesNotMatch(dashboardSource, /校方概览统计接口未提供|待后端提供：校方首页统计 API/)
  assert.doesNotMatch(dashboardSource, /getDashboardCards/)

  assert.match(rosterDirectoryModelSource, /api\.listOpenStudents/)
  assert.match(rosterDirectoryModelSource, /api\.listOpenUsers/)
  assert.match(rosterDirectoryModelSource, /roleCode/)
  assert.doesNotMatch(schoolRosterSource, /platformMock/)

  assert.match(bindingReviewSource, /绑定审核接口未提供/)
  assert.doesNotMatch(bindingReviewSource, /platformMock/)
  assert.doesNotMatch(bindingReviewSource, /v-for="binding/)

  assert.match(competitionDirectoryModelSource, /api\.fetchPublicCompetitions/)
  assert.match(competitionDirectoryModelSource, /api\.fetchPublicCompetitionRegistrationCount/)
  assert.match(competitionRegistrationModelSource, /api\.fetchCompetitionRegistrations/)
  assert.match(competitionViewModelSource, /String\(value\)\.replace\('T', ' '\)/)
  assert.match(competitionViewModelSource, /export function normalizeCompetition/)
  assert.match(competitionViewModelSource, /export function canSignupCompetition/)
  assert.match(competitionManagementModelSource, /useCompetitionRegistrationManagement/)
  assert.match(competitionRegistrationModelSource, /schoolApi\.listOpenUsers\(\{/)
  assert.match(competitionRegistrationModelSource, /roleCode: 'TEACHER'/)
  assert.match(competitionSource, /<select v-model="leadTeacherId"/)
  assert.match(competitionSource, /teacherOptionLabel\(teacher\)/)
  assert.match(competitionViewModelSource, /export function competitionTeacherOptionLabel/)
  assert.doesNotMatch(competitionSource, /带队教师 ID/)
  assert.match(competitionSource, /v-if="role === 'school'"/)
  assert.doesNotMatch(competitionSource, /platformMock/)
  assert.doesNotMatch(competitionSource, /新增本校赛事/)

  assert.match(openOperationsSource, /useOperationsManagement/)
  assert.match(operationsManagementModelSource, /useOperationsDirectory/)
  assert.match(operationsManagementModelSource, /useOperationsTasks/)
  assert.match(operationsDirectoryModelSource, /userApi\.getOpenUser/)
  assert.match(operationsTasksModelSource, /api\.createOpenExportTask/)
  assert.match(operationsTasksModelSource, /api\.downloadOpenExportTask/)
  assert.match(openOperationsSource, /moduleLabel\(log\.module\)/)
  assert.match(openOperationsSource, /operatorLabel\(log\)/)
  assert.match(openOperationsSource, /resultLabel\(log\.result\)/)
  assert.match(openOperationsSource, /riskLabel\(log\.riskLevel\)/)
  assert.match(operationsViewModelSource, /CONTENT_REPORT: '内容举报'/)
  assert.match(operationsViewModelSource, /export function operationTargetLabel/)
  assert.match(operationsViewModelSource, /export function canDownloadOperationExport/)
  assert.doesNotMatch(openOperationsSource, /User #/)

  assert.match(activityDirectoryModelSource, /api\.fetchActivities/)
  assert.match(activityPublishingModelSource, /api\.createActivity/)
  assert.match(activityDirectoryModelSource, /api\.fetchMyActivities/)
  assert.match(activitiesSource, /useActivityManagement/)
  assert.match(activityManagementModelSource, /createMutations/)
  assert.match(activityMutationModelSource, /api\.removeActivity/)
  assert.match(activityCommentModelSource, /api\.removeActivityComment/)
  assert.doesNotMatch(activitiesSource, /platformMock/)
  assert.doesNotMatch(activitiesSource, /activity-new-/)
  assert.doesNotMatch(activitiesSource, /function submitPost/)

  assert.match(profileSettingsModelSource, /api\.fetchAccountProfile\(\)/)
  assert.doesNotMatch(profileSource, /platformMock/)
})

test('teacher pages use backend data from the dedicated workbench and roster APIs', () => {
  assert.match(dashboardSource, /<section v-if="cards\.length" class="overview-section"/)
  assert.match(dashboardSource, /navigationGroupsForRole/)
  assert.match(dashboardModelSource, /api\.fetchTeacherWorkbenchSummary\(\)/)
  assert.match(dashboardModelSource, /if \(role\.value !== 'parent'\) return/)

  assert.match(classRosterSource, /useTeacherRosterDirectory/)
  assert.match(teacherRosterDirectoryModelSource, /api\.fetchTeacherClasses\(\)/)
  assert.match(teacherRosterDirectoryModelSource, /api\.fetchStudents\(\)/)
  assert.match(classRosterSource, /GET \/api\/app\/students\/my-classes/)
  assert.match(classRosterSource, /GET \/api\/app\/students\/my/)
  assert.match(teacherRosterDirectoryModelSource, /teacherClasses\.value = classList\.map\(normalizeTeacherRosterClass\)/)
  assert.match(classRosterSource, /classItem\.studentCount/)
  assert.match(classRosterSource, /classItem\.isHeadTeacher/)
  assert.match(teacherRosterViewModelSource, /student\.classIds\.includes\(activeClassId\)/)
  assert.doesNotMatch(teacherRosterDirectoryModelSource, /schoolAdministrationApi\.listOpenStudents/)
  assert.match(teacherRosterDirectoryModelSource, /当前教师所带班级暂无学生/)
  assert.match(teacherRosterDirectoryModelSource, /studentBelongsToTeacherClasses\(student, assignedClassIds\)/)
  assert.match(teacherRosterViewModelSource, /student\.studentNo/)
  assert.match(teacherRosterViewModelSource, /student\.primaryClass/)
  assert.doesNotMatch(classRosterSource, /platformMock/)
  assert.doesNotMatch(classRosterSource, /listStudentsForUser/)

  assert.match(activityManagementModelSource, /createDirectory/)
  assert.match(activityDirectoryModelSource, /api\.fetchActivities/)
  assert.match(activityPublishingModelSource, /api\.createActivity/)
  assert.match(activityDirectoryModelSource, /api\.fetchMyActivities/)
  assert.match(activitiesSource, /v-model="publishForm\.visibility"/)
  assert.match(activitiesSource, /<option value="SCHOOL">全校可见<\/option>/)
  assert.match(activitiesSource, /<option value="CLASS">班级可见<\/option>/)
  assert.match(activityPublishingModelSource, /activityVisibilityDetails\(publishForm\.visibility\)/)
  assert.match(activityViewModelSource, /title: '全校可见'/)
  assert.match(activityViewModelSource, /title: '班级可见'/)
  assert.match(activityPublishingModelSource, /visibility: role === 'school' \? 'SCHOOL' : 'CLASS'/)
  assert.match(activityViewModelSource, /本校用户均可查看此动态/)
  assert.match(activityViewModelSource, /仅所选班级用户可查看此动态/)
  assert.match(activityPublishingModelSource, /studentsApi\.fetchTeacherClasses\(\)/)
  assert.match(activityPublishingModelSource, /schoolApi\.fetchPublicClasses\(\{/)
  assert.match(activitiesSource, /v-model\.number="publishForm\.classId"/)
  assert.match(activitiesSource, /:class-options="publishClassOptions"/)
  assert.match(activitiesSource, /v-for="classItem in classOptions"/)
  assert.match(activityPublishingModelSource, /请选择自己所带的班级/)
  assert.match(activityPublishingModelSource, /studentsApi\.fetchStudents\(\)/)
  assert.match(activityPublishingModelSource, /schoolApi\.listOpenStudents\(\{ status: 'ACTIVE', page: 1, pageSize: 100 \}\)/)
  assert.match(activityPublishingModelSource, /schoolApi\.getOpenStudent\(student\.id\)/)
  assert.match(activityPublishingModelSource, /detailedStudents\s+\.filter\(student => student\.status === 'ACTIVE'\)\s+\.map\(normalizePublishStudent\)/)
  assert.match(activitiesSource, /v-model="publishForm\.studentIds"/)
  assert.match(activitiesSource, /:student-options="availableStudentOptions"/)
  assert.match(activitiesSource, /v-for="student in studentOptions"/)
  assert.match(activitiesSource, /:disabled="!publishForm\.classId \|\| studentsLoading"/)
  assert.match(activitiesSource, /请先选择班级/)
  assert.match(activityViewModelSource, /student\.classIds\.some/)
  assert.match(activityViewModelSource, /item\.primary \|\| item\.isPrimary/)
  assert.match(activityViewModelSource, /schoolScope \? \{\} : classes\[0\]/)
  assert.match(activityPublishingModelSource, /schoolScope: role === 'school'/)
  assert.match(activityViewModelSource, /schoolScope\s+\? \[primaryClassId\]/)
  assert.match(activityPublishingModelSource, /student\.status === 'ACTIVE'/)
  assert.match(activityPublishingModelSource, /visibility === 'CLASS' && !publishForm\.classId/)
  assert.match(activityPublishingModelSource, /visibility === 'CLASS' && !publishForm\.studentIds\.length/)
  assert.match(activitiesSource, /v-if="publishForm\.visibility === 'CLASS'" class="class-select-field"/)
  assert.match(activitiesSource, /v-if="publishForm\.visibility === 'CLASS'" class="student-select-field"/)
  assert.match(activityDirectoryModelSource, /refreshCurrentUser/)
  assert.match(activityViewModelSource, /account\.school\?\.schoolId/)
  assert.match(activityPublishingModelSource, /String\(classItem\.schoolId\) === String\(currentSchoolId\.value\)/)
  assert.match(activityPublishingModelSource, /String\(student\.schoolId\) === String\(currentSchoolId\.value\)/)
  assert.match(activityPublishingModelSource, /\.\.\.\(visibility === 'CLASS'/)
  assert.match(activityPublishingModelSource, /classId: Number\(publishForm\.classId\)/)
  assert.match(activityPublishingModelSource, /: \{\}\),/)
  assert.doesNotMatch(activitiesSource, /platformMock/)

  assert.match(growthArchiveDirectoryModelSource, /schoolApi\.getOpenStudentProfile/)
  assert.match(growthArchiveDirectoryModelSource, /\/api\/public\/students\/\{id\}\/profile/)

  assert.match(competitionViewModelSource, /不展示报名人员身份信息/)
  assert.match(competitionDirectoryModelSource, /api\.fetchPublicCompetitions/)
  assert.match(competitionDirectoryModelSource, /api\.fetchPublicCompetitionRegistrationCount/)
  assert.match(competitionRegistrationModelSource, /if \(role !== 'school'\) return/)

  assert.match(parentForumSource, /useForumManagement/)
  assert.match(forumManagementModelSource, /createDirectory/)
  assert.match(forumDirectoryModelSource, /api\.fetchForumTopics/)
  assert.doesNotMatch(parentForumSource, /stores\/data\.js/)
  assert.match(messageDirectoryModelSource, /api\.fetchMessageContacts/)
  assert.match(profileSettingsModelSource, /api\.fetchAccountProfile\(\)/)
})

test('teacher roster requests classes and students from the parameterless 11openapi endpoints', async () => {
  const calls = []
  const api = createApiClient({
    get(path, options) {
      calls.push({ method: 'GET', path, options })
      return Promise.resolve([])
    }
  })

  await api.fetchTeacherClasses()
  await api.fetchStudents()

  assert.deepEqual(calls, [
    { method: 'GET', path: '/api/app/students/my-classes', options: undefined },
    { method: 'GET', path: '/api/app/students/my', options: undefined }
  ])
})

test('moment lists forward OpenAPI pagination and explicit student context options', async () => {
  const calls = []
  const api = createApiClient({
    get(path, options) {
      calls.push({ path, options })
      return Promise.resolve({ items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 })
    }
  })

  await api.fetchActivities({ page: 2, pageSize: 50 }, { currentStudentId: '' })
  await api.fetchMyActivities({ page: 3, pageSize: 10 }, { currentStudentId: 12 })

  assert.deepEqual(calls, [
    {
      path: '/api/app/moments',
      options: { currentStudentId: '', query: { page: 2, pageSize: 50 } }
    },
    {
      path: '/api/app/moments/mine',
      options: { currentStudentId: 12, query: { page: 3, pageSize: 10 } }
    }
  ])
})

test('competition page follows 4openapi role visibility and registration rules', () => {
  assert.ok(openapi4.paths['/api/app/competitions']?.get)
  assert.ok(openapi4.paths['/api/app/competitions/{competitionId}/registrations']?.post)
  assert.ok(openapi4.paths['/api/public/competitions']?.get)
  assert.ok(openapi4.paths['/api/public/competitions/{id}/registration-count']?.get)
  assert.ok(openapi4.paths['/api/admin/competitions/{id}/registrations']?.get)

  assert.match(competitionSource, /role === 'parent'/)
  assert.match(competitionDirectoryModelSource, /api\.fetchCompetitions/)
  assert.match(competitionSignupModelSource, /api\.registerCompetition/)
  assert.match(competitionDirectoryModelSource, /api\.fetchPublicCompetitions/)
  assert.match(competitionDirectoryModelSource, /api\.fetchPublicCompetitionRegistrationCount/)
  assert.match(competitionRegistrationModelSource, /api\.fetchCompetitionRegistrations/)
  assert.match(competitionSource, /报名人数/)
  assert.match(competitionSource, /查看报名名单/)
  assert.match(competitionViewModelSource, /PLATFORM: '平台赛事'/)
  assert.match(competitionViewModelSource, /PUBLISHED: '已发布'/)
  assert.match(competitionRegistrationModelSource, /if \(role !== 'school'\) return/)
})

test('parent forum follows 4openapi and persists all mutations through the backend', () => {
  assert.ok(openapi4.paths['/api/app/forum-topics']?.get)
  assert.ok(openapi4.paths['/api/app/forum-topics']?.post)
  assert.ok(openapi4.paths['/api/app/forum-topics/{topicId}']?.get)
  assert.ok(openapi4.paths['/api/app/forum-topics/{topicId}/replies']?.get)
  assert.ok(openapi4.paths['/api/app/forum-topics/{topicId}/replies']?.post)
  assert.ok(openapi4.paths['/api/app/forum-topics/{topicId}/like']?.post)
  assert.ok(openapi4.paths['/api/app/forum-topics/{topicId}/like']?.delete)
  assert.deepEqual(openapi4.components.schemas.CreateForumTopicRequest.required, ['title', 'content', 'tag'])
  assert.deepEqual(openapi4.components.schemas.CreateForumReplyRequest.required, ['content'])

  assert.match(forumDirectoryModelSource, /api\.fetchForumTopics/)
  assert.match(forumManagementModelSource, /createTopicManagement/)
  assert.match(forumTopicModelSource, /api\.createForumTopic/)
  assert.match(forumManagementModelSource, /createReplies/)
  assert.match(forumReplyModelSource, /api\.fetchForumTopicDetail/)
  assert.match(forumReplyModelSource, /api\.fetchForumReplies/)
  assert.match(forumReplyModelSource, /api\.replyForumTopic/)
  assert.match(forumManagementModelSource, /createInteractions/)
  assert.match(forumInteractionModelSource, /api\.likeForumTopic/)
  assert.match(forumInteractionModelSource, /api\.unlikeForumTopic/)
  assert.match(forumDirectoryModelSource, /api\.fetchMyForumTopics/)
  assert.match(forumTopicModelSource, /api\.removeForumTopic/)
  assert.match(forumReplyModelSource, /api\.removeForumReply/)
  assert.match(forumTopicModelSource, /api\.updateForumTopic/)
  assert.match(forumReplyModelSource, /api\.updateForumReply/)
  assert.match(forumInteractionModelSource, /api\.reportForumTopic/)
  assert.match(forumInteractionModelSource, /api\.reportForumReply/)
  assert.match(parentForumSource, /useLiveRefresh\(refreshForumLive, \{ interval: 4000 \}\)/)
  assert.match(forumDirectoryModelSource, /fetchLatestReplies\(topicId\)/)
  assert.match(forumDirectoryModelSource, /mergeForumRecords\(/)
  assert.match(forumDirectoryModelSource, /\.\.\.FORUM_TOPIC_TAGS\.map\(tag => \(\{ key: tag, label: `#\$\{tag\}` \}\)\)/)
  assert.match(forumDirectoryModelSource, /activeTab\.value \? \{ tag: activeTab\.value \} : \{\}/)
  assert.doesNotMatch(parentForumSource, /stores\/data\.js/)
  assert.doesNotMatch(parentForumSource, /localTopics/)
})

test('web school pages use every shared open operation added in 6openapi', () => {
  const source = `${schoolRosterSource}\n${guardianManagementSource}\n${rosterDirectoryModelSource}\n${rosterRecordModelSource}\n${rosterStudentProfileModelSource}\n${rosterTransferModelSource}\n${competitionSource}\n${competitionRegistrationModelSource}\n${openOperationsSource}\n${operationsDirectoryModelSource}\n${operationsTasksModelSource}`
  const operationApiOwners = {
    bindOpenUserStudents: 'api',
    createOpenStudent: 'api',
    createOpenUser: 'api',
    createOpenExportTask: 'exportApi',
    disableOpenStudent: 'api',
    disableOpenUser: 'api',
    enableOpenStudent: 'api',
    enableOpenUser: 'api',
    fetchCompetitionRegistrations: 'api',
    getOpenStudent: 'api',
    getOpenStudentProfile: 'api',
    getOpenUser: 'api',
    listOpenAuditLogs: 'api',
    getOpenAuditLog: 'api',
    listOpenExportTasks: 'api',
    getOpenExportTask: 'api',
    listOpenStudentGuardians: 'api',
    listOpenStudentImportBatches: 'api',
    listOpenStudents: 'api',
    listOpenUsers: 'api',
    downloadOpenExportTask: 'api',
    setOpenStudentClass: 'api',
    unbindOpenStudentGuardian: 'api',
    updateOpenStudent: 'api',
    updateOpenUser: 'api',
    updateOpenUserClasses: 'api'
  }
  for (const method of [
    'listOpenUsers', 'createOpenUser', 'getOpenUser', 'updateOpenUser', 'updateOpenUserClasses', 'bindOpenUserStudents', 'enableOpenUser', 'disableOpenUser',
    'listOpenStudents', 'createOpenStudent', 'getOpenStudent', 'updateOpenStudent', 'setOpenStudentClass', 'enableOpenStudent', 'disableOpenStudent',
    'listOpenStudentGuardians', 'unbindOpenStudentGuardian', 'getOpenStudentProfile',
    'listOpenStudentImportBatches',
    'fetchCompetitionRegistrations',
    'listOpenAuditLogs', 'getOpenAuditLog',
    'listOpenExportTasks', 'createOpenExportTask', 'getOpenExportTask', 'downloadOpenExportTask'
  ]) {
    const apiOwner = operationApiOwners[method] || 'schoolAdministrationApi'
    assert.match(source, new RegExp(`${apiOwner}\\.${method}`))
  }
})

test('web pages consume every user-facing operation added or updated in 7openapi', () => {
  assert.match(activityMutationModelSource, /api\.reportActivity/)
  assert.match(activityMutationModelSource, /api\.reportActivityComment/)
  assert.match(forumTopicModelSource, /api\.updateForumTopic/)
  assert.match(forumReplyModelSource, /api\.updateForumReply/)
  assert.match(forumInteractionModelSource, /api\.reportForumTopic/)
  assert.match(forumInteractionModelSource, /api\.reportForumReply/)
  assert.match(competitionRegistrationModelSource, /api\.setCompetitionLeadTeacher/)
  assert.match(competitionViewModelSource, /export function isPositiveCompetitionId/)
  assert.match(competitionRegistrationModelSource, /classId: registrationFilters\.classId/)
  assert.match(competitionRegistrationModelSource, /startTime: registrationFilters\.startTime/)
  assert.match(competitionRegistrationModelSource, /endTime: registrationFilters\.endTime/)
  assert.match(rosterDirectoryModelSource, /classId: classIdFilter\.value/)
  assert.match(rosterTransferModelSource, /api\.downloadOpenStudentImportTemplate/)
  assert.match(rosterTransferModelSource, /api\.importOpenStudents/)
  assert.doesNotMatch(schoolRosterSource, /student\.bindCode/)
})

test('web pages consume the user-facing rules added by 8openapi', () => {
  assert.ok(activityMutationModelSource.includes('api.updateActivity'))
  assert.ok(activityMutationModelSource.includes('const mediaFileIds = activityFileIds(editMedia.value)'))
  assert.ok(activityMutationModelSource.includes('api.likeActivity'))
  assert.ok(activityMutationModelSource.includes('api.unlikeActivity'))
  assert.ok(activitiesSource.includes("item.likedByMe ? '❤️' : '🤍'"))
  assert.ok(activitiesSource.includes(':media="comment.media || []"'))
  assert.ok(activitiesSource.includes('v-model:media="commentMedia"'))
  assert.ok(activityManagementModelSource.includes('createComments'))
  assert.ok(activityCommentModelSource.includes('const mediaFileIds = activityFileIds(commentMedia.value)'))
  assert.ok(activityCommentModelSource.includes('(!content && !mediaFileIds.length)'))
  assert.ok(forumTopicModelSource.includes('mediaFileIds: forumFileIds(newTopicMedia.value)'))
  assert.ok(parentForumSource.includes(':media="reply.media || []"'))
  assert.ok(parentForumSource.includes('resolveForumMedia(topic, topicDetails.value[topic.topicId])'))
  assert.ok(forumViewModelSource.includes('Array.isArray(detail?.media)'))
  assert.ok(parentForumSource.includes('canSubmitReply(topic.topicId)'))
  assert.ok(forumReplyModelSource.includes('(!content && !mediaFileIds.length)'))
  assert.doesNotMatch(parentForumSource, /placeholder="输入回复\.\.\." required/)
})

test('all web attachment entry points upload through POST /api/app/files', () => {
  assert.match(fileUploaderSource, /type="file"/)
  assert.match(fileUploaderSource, /fileApi\.uploadFile\(\{ file, sourceType: props\.sourceType\.toLowerCase\(\) \}\)/)
  assert.match(fileUploaderSource, /const replacesCurrentFile = computed\(\(\) => !props\.multiple \|\| props\.maxFiles === 1\)/)
  assert.match(fileUploaderSource, /const atCapacity = computed\(\(\) => !replacesCurrentFile\.value && props\.modelValue\.length >= props\.maxFiles\)/)
  assert.match(fileUploaderSource, /image\/jpeg,image\/png,video\/mp4/)
  assert.match(fileUploaderSource, /200 \* 1024 \* 1024/)
  assert.match(fileUploaderSource, /<AppMediaGallery v-if="item\.url" :media="\[item\]" compact/)
  assert.doesNotMatch(fileUploaderSource, /\$\{item\.mediaType \|\| '附件'\} #\$\{item\.fileId\}/)

  assert.match(activitiesSource, /source-type="moment"/)
  assert.match(parentForumSource, /source-type="forum"/)
  assert.match(messageSource, /source-type="message"/)
  assert.match(messageSource, /compact-preview/)
  assert.match(messageSource, /:max-files="9"/)
  assert.match(messageSource, /'single-media': messageAttachmentMedia\(message\)\.length === 1/)
  assert.match(messageSource, /\.message-attachment-gallery\.single-media.*width:min\(220px,62vw\).*min-width:0/)
  assert.equal((parentForumSource.match(/compact-preview/g) || []).length >= 4, true)
  assert.match(parentForumSource, /\.reply-form > button\[type="submit"\].*justify-content:center.*width:64px.*height:40px/)
  assert.match(fileUploaderSource, /\.compact-preview :deep\(\.media-image-link img\).*object-fit:contain/)
  assert.match(fileUploaderSource, /\.compact-preview :deep\(\.media-video\).*object-fit:contain/)
  assert.match(profileSource, /source-type="avatar"/)
  assert.match(messageThreadModelSource, /const attachmentFileIds = uploadedAttachments/)
  assert.match(messageSource, /<AppMediaGallery/)
  assert.doesNotMatch(messageSource, /附件 #\{\{/)
  assert.match(profileSettingsModelSource, /avatarFileId: avatarFiles\.value\[0\]\?\.fileId/)
  assert.match(profileSettingsModelSource, /avatarUrl: avatarFiles\.value\[0\]\?\.url \|\| currentAvatarUrl\.value/)
  assert.match(profileSource, /avatarPreviewUrl/)
  assert.match(profileSource, /'更换头像'/)
  assert.match(profileSource, /aria-label="查看原版头像"/)
  assert.match(profileSource, /:show-file-details="false"/)
  assert.doesNotMatch(profileSource, /学习计划\.png/)
  assert.match(parentForumSource, /avatarSrc\(topic\.author\)/)
  assert.match(parentForumSource, /avatarSrc\(reply\.author\)/)
  assert.match(parentForumSource, /isCurrentAuthor\(author\) \? currentProfile\.value\.avatarUrl/)
  assert.doesNotMatch(activitiesSource, /媒体文件 ID/)
  assert.doesNotMatch(parentForumSource, /媒体文件 ID/)
  assert.match(mediaGallerySource, /<img :src="mediaUrl\(item\.url\)"/)
  assert.match(mediaGallerySource, /<video/)
  assert.doesNotMatch(mediaGallerySource, /#\$\{item\.fileId/)
  assert.match(parentForumSource, /<AppMediaGallery :media="reply\.media \|\| \[\]"/)
  assert.match(activitiesSource, /<AppMediaGallery :media="item\.media"/)
})

test('navbar shows the active student for parents and the current school for school admins and teachers', () => {
  assert.match(navbarSource, /role\.value === 'parent'/)
  assert.match(navbarSource, /currentStudent\.value\?\.name/)
  assert.match(navbarSource, /<span v-if="sessionContextLabel" class="nav-context">/)
  assert.match(navbarSource, /<span class="nav-user">/)
  assert.match(navbarSource, /const accountName = computed/)
  assert.match(navbarSource, /<span>\{\{ roleLabel \}\}<\/span>/)
  assert.match(navbarSource, /CURRENT_STUDENT_CHANGED_EVENT, syncCurrentStudent/)
  assert.match(currentStudentSource, /new window\.CustomEvent\(CURRENT_STUDENT_CHANGED_EVENT/)
  assert.match(navbarSource, /role\.value === 'school'/)
  assert.match(navbarSource, /role\.value === 'teacher'/)
  assert.match(navbarSource, /currentSchoolName\.value/)
  assert.match(navbarSource, /fetchPublicSchoolDetail\(schoolId\)/)
})

test('school admins have a school-scoped class management page', () => {
  assert.match(routerSource, /path:\s*['"]\/school\/classes['"]/)
  assert.match(schoolClassesSource, /创建和维护本校班级/)
  assert.doesNotMatch(schoolClassesSource, /班级 ID：/)
  assert.match(classDirectoryModelSource, /api\.fetchPublicClasses/)
  assert.match(classDirectoryModelSource, /schoolId:\s*schoolId\.value/)
  assert.match(schoolClassesSource, /useSchoolClassManagement/)
  assert.match(schoolClassManagementSource, /useClassDirectory/)
  assert.match(schoolClassManagementSource, /useClassMembership/)
  assert.match(classMembershipModelSource, /roleCode:\s*'TEACHER'/)
  assert.match(classMembershipModelSource, /api\.assignPublicClassTeachers/)
  assert.match(classMembershipModelSource, /重新查询后教师分配尚未生效/)
  assert.doesNotMatch(`${schoolClassesSource}\n${classMembershipModelSource}`, /fetchPublicSchools\(/)
})

test('school class management shows the current class and adds students through the dedicated class endpoint', () => {
  assert.ok(openapi12.paths['/api/public/students/{id}/class']?.patch)
  assert.match(schoolClassesSource, /管理学生/)
  assert.match(classMembershipModelSource, /api\.listOpenStudents/)
  assert.match(classMembershipModelSource, /api\.getOpenStudent/)
  assert.match(classMembershipModelSource, /api\.setOpenStudentClass\(student\.id, targetClass\.id\)/)
  assert.match(classMembershipModelSource, /api\.removeOpenStudentClass\(student\.id\)/)
  assert.match(classStudentAssignmentDialogSource, /removeStudentFromClass\(student\)/)
  assert.match(schoolClassesSource, /仅显示当前班级学生/)
  assert.match(schoolClassesSource, /v-model="selectedStudentId"/)
  assert.match(schoolClassesSource, /v-for="student in availableStudents"/)
  assert.match(schoolClassesSource, /v-for="student in currentClassStudents"/)
  assert.match(schoolClassesSource, /@click="addSelectedStudent"/)
  assert.doesNotMatch(schoolClassesSource, /@dragstart=/)
  assert.doesNotMatch(schoolClassesSource, /@drop\.prevent=/)
  assert.doesNotMatch(schoolClassesSource, /bindCode|绑定码/)
  assert.doesNotMatch(schoolClassesSource, /学生 ID/)
  assert.match(schoolClassesSource, /<small v-if="studentIdentity\(student\)">/)
  assert.match(classMembershipModelSource, /重新查询后学生班级尚未生效/)
  assert.match(classMembershipModelSource, /String\(student\.schoolId\) === String\(schoolId\.value\)/)
})

test('news information page only renders 4openapi public news data', () => {
  assert.ok(openapi4.paths['/api/public/news-articles/categories']?.get)
  assert.ok(openapi4.paths['/api/public/news-articles']?.get)
  assert.ok(openapi4.paths['/api/public/news-articles/{id}']?.get)

  assert.match(newsInfoSource, /useNewsDirectory/)
  assert.match(newsDirectoryModelSource, /api\.fetchPublicNewsCategories\(\)/)
  assert.match(newsDirectoryModelSource, /api\.fetchPublicNews\(/)
  assert.match(newsDirectoryModelSource, /categoryId: activeCategoryId\.value/)
  assert.match(newsDirectoryModelSource, /api\.fetchPublicNewsDetail\(item\.id\)/)
  assert.doesNotMatch(newsInfoSource, /stores\/data\.js/)
  assert.doesNotMatch(newsInfoSource, /addNews|deleteNews|canPublish|canDelete/)
})

test('web user app delegates super admin routes through environment configuration', () => {
  assert.match(loginSource, /resolveAdminWebUrl\(import\.meta\.env\)/)
  assert.doesNotMatch(loginSource, /href="http:\/\/localhost:3101/)
  assert.doesNotMatch(routerSource, /path:\s*['"]\/admin/)
  assert.doesNotMatch(routerSource, /requiresAdmin/)
  assert.doesNotMatch(routerSource, /sjz_admin_logged/)
  assert.doesNotMatch(appSource, /isAdminWorkspace/)
  assert.doesNotMatch(appSource, /admin-main-content/)
})
