import assert from 'node:assert/strict'
import test from 'node:test'

import { useStudentDirectory } from './useStudentDirectory.js'

test('student directory merges active bindings and restores the stored student', async () => {
  const calls = []
  const persisted = []
  const directory = useStudentDirectory({
    api: {
      async fetchStudents() {
        calls.push('students')
        return {
          items: [
            { id: 1, name: '小山' },
            { id: 2, name: '小金' }
          ]
        }
      },
      async fetchGuardianBindings() {
        calls.push('bindings')
        return {
          bindings: [
            { bindingId: 11, studentId: 1, bindStatus: 'APPROVED' },
            { bindingId: 12, studentId: 2, bindStatus: 'BOUND' },
            { bindingId: 13, studentId: 3, bindStatus: 'REJECTED' }
          ]
        }
      }
    },
    readCurrentStudent: () => ({ id: 2 }),
    persistCurrentStudent: student => persisted.push(student),
    removeCurrentStudent: () => calls.push('clear')
  })

  await directory.loadStudents()

  assert.deepEqual(calls, ['students', 'bindings'])
  assert.deepEqual(directory.students.value.map(student => student.id), [1, 2])
  assert.equal(directory.current.value.id, 2)
  assert.equal(persisted.at(-1).id, 2)
  assert.equal(directory.error.value, '')
  assert.equal(directory.loading.value, false)
})

test('student directory switches only active students and persists the response', async () => {
  const calls = []
  const directory = useStudentDirectory({
    api: {
      async switchCurrentStudent(id) {
        calls.push(id)
        return { student: { studentId: id, studentName: '新名字' } }
      }
    },
    readCurrentStudent: () => null,
    persistCurrentStudent: student => calls.push(['persist', student]),
    removeCurrentStudent: () => {}
  })

  assert.equal(
    await directory.selectStudent({ id: 7, bindStatus: 'REJECTED' }),
    false
  )
  assert.equal(
    await directory.selectStudent({ id: 8, bindStatus: 'APPROVED' }),
    true
  )

  assert.equal(calls[0], 8)
  assert.equal(calls[1][0], 'persist')
  assert.equal(calls[1][1].name, '新名字')
  assert.equal(directory.current.value.id, 8)
})

test('student directory clears stale context after a load failure', async () => {
  let cleared = 0
  const directory = useStudentDirectory({
    api: {
      async fetchStudents() {
        throw new Error('网络超时')
      },
      async fetchGuardianBindings() {
        return []
      }
    },
    readCurrentStudent: () => ({ id: 9 }),
    persistCurrentStudent: () => {},
    removeCurrentStudent: () => {
      cleared += 1
    }
  })

  await directory.loadStudents()

  assert.deepEqual(directory.students.value, [])
  assert.equal(directory.current.value, null)
  assert.equal(directory.error.value, '网络超时')
  assert.equal(directory.loading.value, false)
  assert.equal(cleared, 1)
})
