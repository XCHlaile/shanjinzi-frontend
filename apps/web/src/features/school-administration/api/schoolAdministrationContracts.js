import { validateApiContractMap } from '@shanjinzi/api-contracts'

export const schoolAdministrationContracts = validateApiContractMap({
  publicSchools: {
    list: { method: 'GET', path: '/api/public/schools' },
    detail: { method: 'GET', path: '/api/public/schools/{id}' }
  },
  publicClasses: {
    list: { method: 'GET', path: '/api/public/classes' },
    detail: { method: 'GET', path: '/api/public/classes/{id}' },
    create: { method: 'POST', path: '/api/public/classes' },
    update: { method: 'PATCH', path: '/api/public/classes/{id}' },
    delete: { method: 'DELETE', path: '/api/public/classes/{id}' },
    enable: { method: 'PATCH', path: '/api/public/classes/{id}/enable' },
    disable: { method: 'PATCH', path: '/api/public/classes/{id}/disable' },
    assignTeachers: { method: 'POST', path: '/api/public/classes/{id}/teachers' }
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
  publicStudents: {
    list: { method: 'GET', path: '/api/public/students' },
    create: { method: 'POST', path: '/api/public/students' },
    detail: { method: 'GET', path: '/api/public/students/{id}' },
    update: { method: 'PATCH', path: '/api/public/students/{id}' },
    setClass: { method: 'PATCH', path: '/api/public/students/{id}/class' },
    removeClass: { method: 'DELETE', path: '/api/public/students/{id}/class' },
    enable: { method: 'PATCH', path: '/api/public/students/{id}/enable' },
    disable: { method: 'PATCH', path: '/api/public/students/{id}/disable' },
    guardians: { method: 'GET', path: '/api/public/students/{id}/guardians' },
    unbindGuardian: {
      method: 'POST',
      path: '/api/public/students/{id}/guardians/{guardianUserId}/unbind'
    },
    profile: { method: 'GET', path: '/api/public/students/{id}/profile' },
    importTemplate: { method: 'GET', path: '/api/public/students/import/template' },
    import: { method: 'POST', path: '/api/public/students/import' },
    importBatches: { method: 'GET', path: '/api/public/students/import/batches' },
    importBatchDetail: {
      method: 'GET',
      path: '/api/public/students/import/batches/{id}'
    }
  }
}, 'schoolAdministrationContracts')
