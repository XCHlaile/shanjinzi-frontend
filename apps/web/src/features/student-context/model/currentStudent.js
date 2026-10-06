function defaultStorage() {
  return typeof localStorage !== 'undefined' ? localStorage : null
}

export const CURRENT_STUDENT_CHANGED_EVENT = 'sjz:current-student-changed'

function notifyCurrentStudentChanged(student) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new window.CustomEvent(CURRENT_STUDENT_CHANGED_EVENT, { detail: student || null })
  )
}

export function getCurrentStudent(storage = defaultStorage()) {
  try {
    const stored = JSON.parse(storage?.getItem('sjz_current_student') || 'null')
    const storedId = stored?.id || stored?.studentId || stored?.currentStudentId
    if (typeof storedId === 'string' && /^student-\d+$/.test(storedId)) {
      clearCurrentStudent(storage)
      return null
    }
    if (storedId) return stored
  } catch {}
  return null
}

export function clearCurrentStudent(storage = defaultStorage()) {
  storage?.removeItem('sjz_current_student')
  notifyCurrentStudentChanged(null)
}

export function setCurrentStudent(student, storage = defaultStorage()) {
  if (student?.id || student?.studentId || student?.currentStudentId) {
    storage?.setItem('sjz_current_student', JSON.stringify(student))
    notifyCurrentStudentChanged(student)
  } else {
    clearCurrentStudent(storage)
  }
}
