import { validateApiContractMap } from '@shanjinzi/api-contracts'

export const adminApiContracts = validateApiContractMap({
  dashboard: {
    stats: { method: 'GET', path: '/api/admin/dashboard/stats' },
    trends: { method: 'GET', path: '/api/admin/dashboard/trends' },
    rankings: { method: 'GET', path: '/api/admin/dashboard/rankings' },
    operations: { method: 'GET', path: '/api/admin/dashboard/operations' }
  },
  schools: {
    list: { method: 'GET', path: '/api/admin/schools' },
    detail: { method: 'GET', path: '/api/admin/schools/{id}' },
    create: { method: 'POST', path: '/api/admin/schools' },
    update: { method: 'PATCH', path: '/api/admin/schools/{id}' },
    enable: { method: 'PATCH', path: '/api/admin/schools/{id}/enable' },
    disable: { method: 'PATCH', path: '/api/admin/schools/{id}/disable' },
    overview: { method: 'GET', path: '/api/admin/schools/{id}/overview' }
  },
  users: {
    list: { method: 'GET', path: '/api/admin/users' },
    detail: { method: 'GET', path: '/api/admin/users/{id}' },
    create: { method: 'POST', path: '/api/admin/users' },
    update: { method: 'PATCH', path: '/api/admin/users/{id}' },
    updateRole: { method: 'PATCH', path: '/api/admin/users/{id}/role' },
    updateSchool: { method: 'PATCH', path: '/api/admin/users/{id}/school' },
    updateClasses: { method: 'PATCH', path: '/api/admin/users/{id}/classes' },
    resetPassword: { method: 'POST', path: '/api/admin/users/{id}/reset-password' },
    enable: { method: 'PATCH', path: '/api/admin/users/{id}/enable' },
    disable: { method: 'PATCH', path: '/api/admin/users/{id}/disable' },
    softDelete: { method: 'DELETE', path: '/api/admin/users/{id}' }
  },
  students: {
    list: { method: 'GET', path: '/api/public/students' },
    create: { method: 'POST', path: '/api/public/students' },
    detail: { method: 'GET', path: '/api/public/students/{id}' },
    update: { method: 'PATCH', path: '/api/public/students/{id}' },
    setClass: { method: 'PATCH', path: '/api/public/students/{id}/class' },
    enable: { method: 'PATCH', path: '/api/public/students/{id}/enable' },
    disable: { method: 'PATCH', path: '/api/public/students/{id}/disable' },
    guardians: { method: 'GET', path: '/api/public/students/{id}/guardians' },
    unbindGuardian: { method: 'POST', path: '/api/public/students/{id}/guardians/{guardianUserId}/unbind' },
    profile: { method: 'GET', path: '/api/public/students/{id}/profile' },
    importBatches: { method: 'GET', path: '/api/public/students/import/batches' },
    importBatchDetail: { method: 'GET', path: '/api/public/students/import/batches/{id}' },
    importStudents: { method: 'POST', path: '/api/public/students/import' },
    importTemplate: { method: 'GET', path: '/api/public/students/import/template' }
  },
  publicSchools: {
    list: { method: 'GET', path: '/api/public/schools' },
    detail: { method: 'GET', path: '/api/public/schools/{id}' }
  },
  classes: {
    list: { method: 'GET', path: '/api/public/classes' },
    detail: { method: 'GET', path: '/api/public/classes/{id}' },
    create: { method: 'POST', path: '/api/public/classes' },
    update: { method: 'PATCH', path: '/api/public/classes/{id}' },
    delete: { method: 'DELETE', path: '/api/public/classes/{id}' },
    enable: { method: 'PATCH', path: '/api/public/classes/{id}/enable' },
    disable: { method: 'PATCH', path: '/api/public/classes/{id}/disable' },
    assignTeachers: { method: 'POST', path: '/api/public/classes/{id}/teachers' }
  },
  simulations: {
    listTargets: { implemented: false },
    enter: { implemented: false },
    exit: { implemented: false }
  },
  pages: {
    list: { method: 'GET', path: '/api/admin/page-contents' },
    create: { method: 'POST', path: '/api/admin/page-contents' },
    detail: { method: 'GET', path: '/api/admin/page-contents/{pageKey}' },
    update: { method: 'PUT', path: '/api/admin/page-contents/{pageKey}' },
    publish: { method: 'PATCH', path: '/api/admin/page-contents/{pageKey}/publish' },
    offline: { method: 'PATCH', path: '/api/admin/page-contents/{pageKey}/offline' },
    versions: { method: 'GET', path: '/api/admin/page-contents/{pageKey}/versions' }
  },
  news: {
    list: { method: 'GET', path: '/api/admin/news-articles' },
    detail: { method: 'GET', path: '/api/admin/news-articles/{id}' },
    create: { method: 'POST', path: '/api/admin/news-articles' },
    update: { method: 'PUT', path: '/api/admin/news-articles/{id}' },
    delete: { method: 'DELETE', path: '/api/admin/news-articles/{id}' },
    publish: { method: 'PATCH', path: '/api/admin/news-articles/{id}/publish' },
    offline: { method: 'PATCH', path: '/api/admin/news-articles/{id}/offline' },
    pin: { method: 'PATCH', path: '/api/admin/news-articles/{id}/pin' },
    sortOrder: { method: 'PATCH', path: '/api/admin/news-articles/{id}/sort-order' },
    articleCategory: { method: 'PATCH', path: '/api/admin/news-articles/{id}/category' },
    schedule: { method: 'PUT', path: '/api/admin/news-articles/{id}/schedule' },
    categories: { method: 'GET', path: '/api/admin/news-categories' },
    createCategory: { method: 'POST', path: '/api/admin/news-categories' },
    categoryDetail: { method: 'GET', path: '/api/admin/news-categories/{id}' },
    updateCategory: { method: 'PUT', path: '/api/admin/news-categories/{id}' },
    deleteCategory: { method: 'DELETE', path: '/api/admin/news-categories/{id}' }
  },
  competitions: {
    list: { method: 'GET', path: '/api/public/competitions' },
    detail: { method: 'GET', path: '/api/public/competitions/{id}' },
    create: { method: 'POST', path: '/api/admin/competitions' },
    update: { method: 'PUT', path: '/api/admin/competitions/{id}' },
    delete: { method: 'DELETE', path: '/api/admin/competitions/{id}' },
    publish: { method: 'PATCH', path: '/api/admin/competitions/{id}/publish' },
    offline: { method: 'PATCH', path: '/api/admin/competitions/{id}/offline' },
    registrations: { method: 'GET', path: '/api/admin/competitions/{id}/registrations' },
    infoUrl: { method: 'PATCH', path: '/api/admin/competitions/{id}/info-url' }
  },
  contentReports: {
    list: { method: 'GET', path: '/api/admin/content-reports' },
    detail: { method: 'GET', path: '/api/admin/content-reports/{reportId}' },
    handle: { method: 'PATCH', path: '/api/admin/content-reports/{reportId}/handle' }
  },
  auditLogs: {
    list: { method: 'GET', path: '/api/admin/audit-logs' },
    detail: { method: 'GET', path: '/api/admin/audit-logs/{id}' }
  },
  exports: {
    list: { method: 'GET', path: '/api/admin/export-tasks' },
    create: { method: 'POST', path: '/api/admin/export-tasks' },
    detail: { method: 'GET', path: '/api/admin/export-tasks/{id}' },
    download: { method: 'GET', path: '/api/admin/export-tasks/{id}/download' },
    downloadInfo: { method: 'GET', path: '/api/admin/export-tasks/{id}/download-info' }
  },
  openUsers: {
    list: { method: 'GET', path: '/api/open/users' },
    create: { method: 'POST', path: '/api/open/users' },
    detail: { method: 'GET', path: '/api/open/users/{id}' },
    update: { method: 'PATCH', path: '/api/open/users/{id}' },
    updateClasses: { method: 'PATCH', path: '/api/open/users/{id}/classes' },
    bindStudents: { method: 'POST', path: '/api/open/users/{id}/bind-students' },
    enable: { method: 'PATCH', path: '/api/open/users/{id}/enable' },
    disable: { method: 'PATCH', path: '/api/open/users/{id}/disable' }
  },
  messageBroadcasts: {
    list: { method: 'GET', path: '/api/admin/message-broadcasts' },
    create: { method: 'POST', path: '/api/admin/message-broadcasts' },
    detail: { method: 'GET', path: '/api/admin/message-broadcasts/{broadcastId}' },
    retry: { method: 'POST', path: '/api/admin/message-broadcasts/{broadcastId}/retry' }
  },
  openCompetitions: {
    registrations: { method: 'GET', path: '/api/open/competitions/{id}/registrations' },
    parentRegistrations: { method: 'GET', path: '/api/open/competitions/registrations' },
    leadTeacher: { method: 'PATCH', path: '/api/open/competitions/{id}/lead-teacher' }
  },
  openAuditLogs: {
    list: { method: 'GET', path: '/api/open/audit-logs' },
    detail: { method: 'GET', path: '/api/open/audit-logs/{id}' }
  },
  openExports: {
    list: { method: 'GET', path: '/api/open/export-tasks' },
    create: { method: 'POST', path: '/api/open/export-tasks' },
    detail: { method: 'GET', path: '/api/open/export-tasks/{id}' },
    download: { method: 'GET', path: '/api/open/export-tasks/{id}/download' }
  }
}, 'adminApiContracts')
