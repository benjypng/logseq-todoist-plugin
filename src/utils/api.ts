import { v4 as genUUID } from 'uuid'
import wretch from 'wretch'

import { TodoistSendResponse, TodoistSyncResponse } from '../interfaces'

const client = () =>
  wretch('https://api.todoist.com/api/v1/sync')
    .auth(`Bearer ${logseq.settings?.apiToken}`)
    .content('application/json')

export const api = {
  sync: async () => {
    const currentToken = logseq.settings?.syncToken ?? '*'

    const response = await client()
      .post({
        sync_token: currentToken,
        resource_types: ['items'],
      })
      .json<TodoistSyncResponse>()

    logseq.updateSettings({
      ...logseq.settings,
      syncToken: response.sync_token,
    })

    return response
  },
  send: async (blkUuid: string, task: string) => {
    const uuid = genUUID()
    const response = await client()
      .post({
        commands: [
          {
            type: 'item_add',
            uuid: uuid,
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
  },
  setComplete: async (todoistId: string) => {
    const uuid = genUUID()
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
  },
  setInComplete: async (todoistId: string) => {
    const uuid = genUUID()
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
  },
}
