import { forumApi } from '../api/forumApi.js'
import { useForumReplyComposer } from './useForumReplyComposer.js'
import { useForumReplyDirectory } from './useForumReplyDirectory.js'
import { useForumReplyMutations } from './useForumReplyMutations.js'
import { useForumReplyState } from './useForumReplyState.js'

const noop = () => {}

export function useForumReplies({
  topicDetails,
  api = forumApi,
  confirm = async () => {},
  notify = { success: noop, error: noop }
}) {
  const state = useForumReplyState()
  const directory = useForumReplyDirectory({
    api,
    notify,
    state,
    topicDetails
  })
  const composer = useForumReplyComposer({
    api,
    notify,
    state,
    topicDetails
  })
  const mutations = useForumReplyMutations({
    api,
    confirm,
    notify,
    state
  })

  return {
    ...state,
    ...directory,
    ...composer,
    ...mutations
  }
}
