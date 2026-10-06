import assert from 'node:assert/strict'
import test from 'node:test'
import { ref } from 'vue'

import { useCompetitionSignup } from './useCompetitionSignup.js'

function createSignup(apiOverrides = {}) {
  const calls = []
  const actionMessage = ref('')
  const signup = useCompetitionSignup({
    currentStudent: {
      id: 8,
      name: '小山',
      primaryClass: { name: '一班' }
    },
    user: { phone: '13800000000' },
    actionMessage,
    reloadCompetitions: async () => calls.push(['reload']),
    api: {
      async registerCompetition(id, payload) {
        calls.push(['register', id, payload])
      },
      ...apiOverrides
    }
  })
  return { actionMessage, calls, signup }
}

test('competition signup opens only eligible competitions and resets the form', () => {
  const { signup } = createSignup()
  signup.signupForm.remark = '旧备注'

  signup.openSignup({ id: 3, registrationOpen: true })

  assert.equal(signup.signup.value.id, 3)
  assert.deepEqual({ ...signup.signupForm }, {
    studentName: '小山',
    className: '一班',
    phone: '13800000000',
    remark: ''
  })
  assert.equal(
    signup.signupButtonText({ registrationOpen: true }),
    '为 小山 报名'
  )

  signup.closeSignup()
  signup.openSignup({ id: 4, registrationOpen: false })
  assert.equal(signup.signup.value, null)
})

test('competition signup submits the strict payload and refreshes the list', async () => {
  const { actionMessage, calls, signup } = createSignup()
  signup.openSignup({ id: 3, registrationOpen: true })
  signup.signupForm.remark = '希望参加'

  await signup.submitSignup()

  assert.deepEqual(calls, [
    ['register', 3, { remark: '希望参加' }],
    ['reload']
  ])
  assert.equal(signup.signup.value, null)
  assert.equal(actionMessage.value, '赛事报名提交成功')
  assert.equal(signup.signupSubmitting.value, false)
})

test('competition signup keeps the dialog open when submission fails', async () => {
  const { calls, signup } = createSignup({
    async registerCompetition() {
      calls.push(['register'])
      throw new Error('报名已截止')
    }
  })
  signup.openSignup({ id: 3, registrationOpen: true })

  await signup.submitSignup()

  assert.equal(signup.signup.value.id, 3)
  assert.equal(signup.signupError.value, '报名已截止')
  assert.equal(signup.signupSubmitting.value, false)
})
