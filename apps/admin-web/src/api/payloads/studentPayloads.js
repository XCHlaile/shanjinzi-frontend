function guardianItems(payload) {
  return Array.isArray(payload) ? payload : payload?.items || payload?.records || []
}

function boundGuardians(payload) {
  return guardianItems(payload).filter(guardian => {
    const bindStatus = String(guardian?.bindStatus || '').toUpperCase()
    return !bindStatus || bindStatus === 'BOUND'
  })
}

export function countBoundGuardians(payload) {
  return boundGuardians(payload).length
}

export function primaryStudentClass(student = {}) {
  const classes = Array.isArray(student.classes) ? student.classes : []
  return classes.find(classItem => classItem?.isPrimary) || classes[0] || null
}
