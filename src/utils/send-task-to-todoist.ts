import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { api } from '../features/sync/api'
import { todoistCache } from '../features/sync/cache'
import { resolveCreatedTaskId } from '../features/sync/temp-id'
import { SyncLock } from '../interfaces'
import { getTodoistIdPropIdent } from './get-todoistid-prop-ident'

export const sendTaskToTodoist = async (
  taskBlk: BlockEntity,
  syncLock: SyncLock,
) => {
  const response = await api.send(taskBlk.uuid, taskBlk.title)
  const newTodoistId = resolveCreatedTaskId(response)
  if (!newTodoistId) return

  try {
    syncLock.isInternalSync = true
    const todoistIdPropIdent = await getTodoistIdPropIdent()
    if (!todoistIdPropIdent) return

    await logseq.Editor.upsertBlockProperty(
      taskBlk.uuid,
      todoistIdPropIdent,
      newTodoistId,
    )
  } finally {
    syncLock.isInternalSync = false
  }

  todoistCache.set(newTodoistId, taskBlk.uuid)
}
