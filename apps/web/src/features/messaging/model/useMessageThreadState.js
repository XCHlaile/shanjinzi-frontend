import { computed, ref, watch } from 'vue'

import { canRecallMessage, isOwnMessage } from '../lib/messageActions.js'
import {
  mergeMessageAttachmentCache,
  readMessageAttachmentCache,
  resolveMessageAttachmentMedia,
  writeMessageAttachmentCache
} from '../lib/messageAttachments.js'

export function useMessageThreadState({
  currentUserId,
  providedActiveConversation
}) {
  const activeConversation = providedActiveConversation || ref(null)
  const activeContact = ref(null)
  const messages = ref([])
  const messagePage = ref(1)
  const messageTotalPages = ref(0)
  const messagesLoading = ref(false)
  const messagePolling = ref(false)
  const messageError = ref('')
  const streamRef = ref(null)
  const draft = ref('')
  const messageAttachments = ref([])
  const messageAttachmentCache = ref(readMessageAttachmentCache())
  const attachmentUploading = ref(false)
  const sending = ref(false)
  const settingsBusy = ref(false)

  const activeParticipant = computed(() => (
    activeConversation.value?.participant || activeContact.value
  ))
  const canSend = computed(() => Boolean(
    activeParticipant.value?.id
    && (draft.value.trim() || messageAttachments.value.length)
    && !attachmentUploading.value
  ))

  watch(messageAttachments, items => {
    messageAttachmentCache.value = mergeMessageAttachmentCache(
      messageAttachmentCache.value,
      items
    )
    writeMessageAttachmentCache(messageAttachmentCache.value)
  }, { deep: true })

  function messageAttachmentMedia(message) {
    return resolveMessageAttachmentMedia(message, messageAttachmentCache.value)
  }

  function isMine(message = {}) {
    return isOwnMessage(message, currentUserId)
  }

  function canRecall(message) {
    return canRecallMessage(message, currentUserId)
  }

  return {
    activeContact,
    activeConversation,
    activeParticipant,
    attachmentUploading,
    canRecall,
    canSend,
    draft,
    isMine,
    messageAttachmentCache,
    messageAttachmentMedia,
    messageAttachments,
    messageError,
    messagePage,
    messagePolling,
    messages,
    messagesLoading,
    messageTotalPages,
    sending,
    settingsBusy,
    streamRef
  }
}
