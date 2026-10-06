export { createStudentApi, studentApi, studentContracts } from './api/studentApi.js'
export {
  ACTIVE_STUDENT_BINDING_STATUSES,
  DEFAULT_STUDENT_RELATION_TYPE,
  STUDENT_RELATION_OPTIONS,
  guardianBindingToStudent,
  isActiveStudentBinding,
  mergeBoundStudents,
  normalizeContextStudent,
  studentAgeFromBirthday,
  studentBindStatusLabel,
  studentContextList,
  studentRelationLabel
} from './lib/studentContextViewModel.js'
export * from './model/currentStudent.js'
export { useStudentBinding } from './model/useStudentBinding.js'
export {
  useStudentContextManagement
} from './model/useStudentContextManagement.js'
export { useStudentDirectory } from './model/useStudentDirectory.js'
