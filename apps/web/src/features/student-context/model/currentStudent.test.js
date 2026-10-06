import assert from 'node:assert/strict'
import test from 'node:test'

import {
  clearCurrentStudent,
  getCurrentStudent,
  setCurrentStudent
} from './currentStudent.js'

function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
    removeItem(key) {
      data.delete(key)
    }
  }
}

test('persists only backend current-student selections', () => {
  const storage = createMemoryStorage()

  assert.equal(getCurrentStudent(storage), null)

  setCurrentStudent({ id: 12, name: 'real student' }, storage)
  assert.deepEqual(getCurrentStudent(storage), { id: 12, name: 'real student' })

  clearCurrentStudent(storage)
  assert.equal(getCurrentStudent(storage), null)
})

test('drops legacy mock current-student selections', () => {
  const storage = createMemoryStorage({
    sjz_current_student: JSON.stringify({ id: 'student-1', name: 'mock student' })
  })

  assert.equal(getCurrentStudent(storage), null)
  assert.equal(storage.getItem('sjz_current_student'), null)
})
