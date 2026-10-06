import assert from 'node:assert/strict'
import test from 'node:test'

import { createLiveRefreshController } from './liveRefresh.js'

function createEventTarget() {
  const listeners = new Map()
  return {
    hidden: false,
    addEventListener(event, listener) {
      listeners.set(event, listener)
    },
    removeEventListener(event, listener) {
      if (listeners.get(event) === listener) listeners.delete(event)
    },
    async emit(event) {
      await listeners.get(event)?.()
    },
    has(event) {
      return listeners.has(event)
    }
  }
}

test('refreshes on a timer and pauses while the page is hidden', async () => {
  const pageDocument = createEventTarget()
  const pageWindow = createEventTarget()
  let scheduled = null
  let cleared = null
  let refreshCount = 0
  const controller = createLiveRefreshController(async () => { refreshCount += 1 }, {
    interval: 3000,
    document: pageDocument,
    window: pageWindow,
    setTimer(callback, interval) {
      assert.equal(interval, 3000)
      scheduled = callback
      return 7
    },
    clearTimer(timer) {
      cleared = timer
    }
  })

  controller.start()
  await scheduled()
  assert.equal(refreshCount, 1)

  pageDocument.hidden = true
  await controller.trigger()
  assert.equal(refreshCount, 1)

  pageDocument.hidden = false
  await pageWindow.emit('focus')
  assert.equal(refreshCount, 2)

  controller.stop()
  assert.equal(cleared, 7)
  assert.equal(pageDocument.has('visibilitychange'), false)
})

test('does not overlap slow refresh requests', async () => {
  let releaseRefresh
  let refreshCount = 0
  const controller = createLiveRefreshController(() => {
    refreshCount += 1
    return new Promise(resolve => { releaseRefresh = resolve })
  }, { document: createEventTarget(), window: createEventTarget() })

  const firstRefresh = controller.trigger()
  assert.equal(await controller.trigger(), false)
  assert.equal(refreshCount, 1)
  releaseRefresh()
  assert.equal(await firstRefresh, true)
})
