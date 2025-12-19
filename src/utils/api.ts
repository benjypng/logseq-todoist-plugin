import wretch from 'wretch'

import { TodoistSyncResponse } from '../interfaces'

const client = () =>
  wretch('https://api.todoist.com/api/v1/sync')
    .auth(`Bearer ${logseq.settings?.apiToken}`)
    .content('application/json')

export const api = {
  sync: async (): Promise<TodoistSyncResponse> => {
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
}
