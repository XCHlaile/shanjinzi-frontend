import { studentManagementApi } from '../api/studentManagementApi.js'
import { useStudentDirectory } from './useStudentDirectory.js'
import { useStudentImport } from './useStudentImport.js'
import { useStudentRelationships } from './useStudentRelationships.js'

const silentFeedback = {
  error() {},
  info() {},
  success() {}
}

const silentDialogs = {
  async confirm() {}
}

export function useStudentManagement({
  api = studentManagementApi,
  dialogs = silentDialogs,
  feedback = silentFeedback,
  saveFile
} = {}) {
  const directory = useStudentDirectory({
    api,
    dialogs,
    feedback,
    saveFile
  })
  const relationships = useStudentRelationships({
    api,
    dialogs,
    feedback,
    loadStudents: directory.loadStudents,
    rows: directory.rows
  })
  const studentImport = useStudentImport({
    api,
    feedback,
    saveFile
  })

  return {
    ...directory,
    ...relationships,
    ...studentImport
  }
}
