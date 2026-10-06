import { saveBrowserFile } from '../../../shared/lib/browserDownload.js'
import { useStudentDetailActions } from './useStudentDetailActions.js'
import { useStudentEditor } from './useStudentEditor.js'
import { useStudentList } from './useStudentList.js'

export function useStudentDirectory({
  api,
  dialogs,
  feedback,
  saveFile = saveBrowserFile
}) {
  const studentList = useStudentList({
    api,
    feedback,
    saveFile
  })
  const editor = useStudentEditor({
    api,
    feedback,
    loadStudents: studentList.loadStudents
  })
  const detailActions = useStudentDetailActions({
    api,
    dialogs,
    feedback,
    loadGuardianSummary: studentList.loadGuardianSummary,
    loadStudents: studentList.loadStudents
  })

  return {
    ...studentList,
    ...editor,
    ...detailActions
  }
}
