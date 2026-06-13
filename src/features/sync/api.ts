import type { SyncCommand, SyncResponse } from '@doist/todoist-sdk'
import { v4 as genUUID } from 'uuid'

import { getTodoistApi } from './todoist-client'

const handleError = (context: string, e: unknown): null => {
  const message = e instanceof Error ? e.message : 'Unknown error'
  console.error(new Date().toISOString(), `Todoist (${context}):`, e)
  logseq.UI.showMsg(`Todoist Error (${context}): ${message}`, 'error')
  return null
}

const persistToken = (token: string | undefined) => {
  if (token) logseq.updateSettings({ syncToken: token })
}

export const api = {
  getInboxId: async (): Promise<string | null> => {
    try {
      const res = await getTodoistApi().sync({
        syncToken: '*',
        resourceTypes: ['user'],
      })
      return res.user?.inboxProjectId ?? null
    } catch (e) {
      return handleError('Get Inbox ID', e)
    }
  },
  sync: async (): Promise<SyncResponse | null> => {
    try {
      const currentToken = (logseq.settings?.syncToken as string) ?? '*'
      return await getTodoistApi().sync({
        syncToken: currentToken,
        resourceTypes: ['items'],
      })
    } catch (e) {
      return handleError('Sync', e)
    }
  },
  send: async (blkUuid: string, task: string): Promise<SyncResponse | null> => {
    try {
      const commands: SyncCommand[] = [
        {
          type: 'item_add',
          uuid: blkUuid,
          tempId: blkUuid,
          args: { content: task },
        },
      ]
      const res = await getTodoistApi().sync({ commands })
      persistToken(res.syncToken)
      return res
    } catch (e) {
      return handleError('Add Task', e)
    }
  },
  setComplete: async (todoistId: string): Promise<SyncResponse | null> => {
    try {
      const commands: SyncCommand[] = [
        {
          type: 'item_complete',
          uuid: genUUID(),
          args: { id: todoistId, completedAt: new Date().toISOString() },
        },
      ]
      const res = await getTodoistApi().sync({ commands })
      persistToken(res.syncToken)
      return res
    } catch (e) {
      return handleError('Complete Task', e)
    }
  },
  setInComplete: async (todoistId: string): Promise<SyncResponse | null> => {
    try {
      const commands: SyncCommand[] = [
        { type: 'item_uncomplete', uuid: genUUID(), args: { id: todoistId } },
      ]
      const res = await getTodoistApi().sync({ commands })
      persistToken(res.syncToken)
      return res
    } catch (e) {
      return handleError('Uncomplete Task', e)
    }
  },
  updateContent: async (
    todoistId: string,
    newContent: string,
  ): Promise<SyncResponse | null> => {
    try {
      const commands: SyncCommand[] = [
        {
          type: 'item_update',
          uuid: genUUID(),
          args: { id: todoistId, content: newContent },
        },
      ]
      const res = await getTodoistApi().sync({ commands })
      persistToken(res.syncToken)
      return res
    } catch (e) {
      return handleError('Update Content', e)
    }
  },
}
