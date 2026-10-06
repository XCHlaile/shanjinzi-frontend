// Pure student-domain selectors shared by several user-facing features.
const guardianRelationTypeMap = {
  爸爸: 'FATHER',
  父亲: 'FATHER',
  妈妈: 'MOTHER',
  母亲: 'MOTHER',
  爷爷: 'GRANDFATHER_PATERNAL',
  奶奶: 'GRANDMOTHER_PATERNAL',
  外公: 'GRANDFATHER_MATERNAL',
  外婆: 'GRANDMOTHER_MATERNAL'
}

export function normalizeGuardianRelationType(value) {
  return guardianRelationTypeMap[value] || value
}

export function countBoundGuardians(payload) {
  const guardians = Array.isArray(payload) ? payload : payload?.items || payload?.records || []
  return guardians.filter(guardian => {
    const bindStatus = String(guardian?.bindStatus || '').toUpperCase()
    return !bindStatus || bindStatus === 'BOUND'
  }).length
}

export function primaryStudentClass(student = {}) {
  const classes = Array.isArray(student.classes) ? student.classes : []
  return classes.find(classItem => classItem?.isPrimary) || classes[0] || null
}
