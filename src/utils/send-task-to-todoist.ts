import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { PLUGIN_PROPERTY_KEY } from '../constants'
import { api } from '../features/sync/api'
import { todoistCache } from '../features/sync/cache'
import { SyncLock } from '../interfaces'

export const sendTaskToTodoist = async (
  taskBlk: BlockEntity,
  syncLock: SyncLock,
) => {
  const response = await api.send(taskBlk.uuid, taskBlk.title)
  if (!response || !response.temp_id_mapping[taskBlk.uuid]) return

  const newTodoistId = response.temp_id_mapping[taskBlk.uuid] as string

  try {
    syncLock.isInternalSync = true
    await logseq.Editor.upsertBlockProperty(
      taskBlk.uuid,
      PLUGIN_PROPERTY_KEY,
      newTodoistId,
    )
  } finally {
    syncLock.isInternalSync = false
  }

  todoistCache.set(newTodoistId, taskBlk.uuid)
}
