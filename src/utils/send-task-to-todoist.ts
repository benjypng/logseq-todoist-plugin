import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { api } from '../features/sync/api'
import { todoistCache } from '../features/sync/cache'
import { SyncLock } from '../interfaces'
import { getTodoistIdPropIdent } from './get-todoistid-prop-ident'

export const sendTaskToTodoist = async (
  taskBlk: BlockEntity,
  syncLock: SyncLock,
) => {
  const response = await api.send(taskBlk.uuid, taskBlk.title)
  if (!response || !response.temp_id_mapping[taskBlk.uuid]) return

  const newTodoistId = response.temp_id_mapping[taskBlk.uuid] as string

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
