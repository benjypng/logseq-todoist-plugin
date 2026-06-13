import { v4 as genUUID } from 'uuid'
import wretch from 'wretch'

import {
  TodoistSendResponse,
  TodoistSyncResponse,
  TodoistUserSyncItem,
} from '../../interfaces'

const client = () =>
  wretch('https://api.todoist.com/api/v1/sync')
    .auth(`Bearer ${logseq.settings?.apiToken}`)
    .content('application/json')

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const requestWithRetry = async <T>(
  apiCall: () => Promise<T>,
  context: string,
  attempt = 1,
  maxRetries = 3,
  backoffDelay = 1000,
): Promise<T | null> => {
  try {
    return await apiCall()
  } catch (e: any) {
    if (
      (e.status === 429 || e?.response?.status === 429) &&
      attempt <= maxRetries
    ) {
      const retryHeader = e.response?.headers?.get('Retry-After')

      let waitTimeMs = backoffDelay
      if (retryHeader) {
        const seconds = parseInt(retryHeader, 10)
        if (!isNaN(seconds)) {
          waitTimeMs = seconds * 1000
        }
      }

      logseq.UI.showMsg(
        `Todoist Rate Limit: Retrying ${context} in ${Math.ceil(waitTimeMs / 1000)}s...`,
        'warning',
      )

      await sleep(waitTimeMs)

      return requestWithRetry(
        apiCall,
        context,
        attempt + 1,
        maxRetries,
        backoffDelay * 2,
      )
    }

    const errorMessage = e?.message || 'Unknown error'
    logseq.UI.showMsg(
      `Todoist Sync Error (${context}): ${errorMessage}`,
      'error',
    )

    return null
  }
}

export const api = {
  getInboxId: async () => {
    return requestWithRetry(async () => {
      const response = await client()
        .post({
          sync_token: '*',
          resource_types: ['user'],
        })
        .json<TodoistUserSyncItem>()

      return response.user.inbox_project_id
    }, 'Get Inbox ID')
  },
  sync: async () => {
    return requestWithRetry(async () => {
      const currentToken = logseq.settings?.syncToken ?? '*'

      const response = await client()
        .post({
          sync_token: currentToken,
          resource_types: ['items'],
        })
        .json<TodoistSyncResponse>()

      return response
    }, 'Sync')
  },
  send: async (blkUuid: string, task: string) => {
    return requestWithRetry(async () => {
      const response = await client()
        .post({
          commands: [
            {
              type: 'item_add',
              uuid: blkUuid,
              temp_id: blkUuid,
              args: {
                content: task,
              },
            },
          ],
        })
        .json<TodoistSendResponse>()

      logseq.updateSettings({
        ...logseq.settings,
        syncToken: response.sync_token,
      })

      return response
    }, 'Add Task')
  },
  setComplete: async (todoistId: string) => {
    const uuid = genUUID()
    return requestWithRetry(async () => {
      const response = await client()
        .post({
          commands: [
            {
              type: 'item_close',
              uuid: uuid,
              args: {
                id: todoistId,
                date_completed: new Date().toISOString(),
              },
            },
          ],
        })
        .json<TodoistSendResponse>()

      logseq.updateSettings({
        ...logseq.settings,
        syncToken: response.sync_token,
      })

      return response
    }, 'Complete Task')
  },
  setInComplete: async (todoistId: string) => {
    const uuid = genUUID()
    return requestWithRetry(async () => {
      const response = await client()
        .post({
          commands: [
            {
              type: 'item_uncomplete',
              uuid: uuid,
              args: {
                id: todoistId,
              },
            },
          ],
        })
        .json<TodoistSendResponse>()

      logseq.updateSettings({
        ...logseq.settings,
        syncToken: response.sync_token,
      })

      return response
    }, 'Uncomplete Task')
  },
  updateContent: async (todoistId: string, newContent: string) => {
    const uuid = genUUID()
    return requestWithRetry(async () => {
      const response = await client()
        .post({
          commands: [
            {
              type: 'item_update',
              uuid: uuid,
              args: {
                id: todoistId,
                content: newContent,
              },
            },
          ],
        })
        .json<TodoistSendResponse>()

      logseq.updateSettings({
        ...logseq.settings,
        syncToken: response.sync_token,
      })

      return response
    }, 'Update Content')
  },
}
