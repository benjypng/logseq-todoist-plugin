import { TodoistApi } from '@doist/todoist-sdk'

import { logseqFetch } from './logseq-fetch'

export const getTodoistApi = (): TodoistApi =>
  new TodoistApi(logseq.settings!.apiToken as string, {
    customFetch: logseqFetch,
  })
