import { useStudentBinding } from './useStudentBinding.js'
import { useStudentDirectory } from './useStudentDirectory.js'

export function useStudentContextManagement({
  confirm = async () => {},
  notify = { success() {}, error() {}, warning() {} },
  createDirectory = useStudentDirectory,
  createBinding = useStudentBinding
} = {}) {
  const directory = createDirectory()
  const binding = createBinding({
    reloadStudents: directory.loadStudents,
    confirm,
    notify
  })

  function initialize() {
    return Promise.all([
      directory.loadStudents(),
      binding.loadSchools()
    ])
  }

  return {
    ...directory,
    ...binding,
    initialize
  }
}
