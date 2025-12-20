import { appendBlockWithTagAndProp, setTaskStatus } from '../../utils'
import { api } from './api'
import { todoistCache } from './cache'

export const triggerSync = async (isInternalSync: boolean) => {
  if (isInternalSync) return // Handle race condition

  isInternalSync = true
  try {
    const data = await api.sync()
    if (data.items.length === 0) {
      logseq.UI.showMsg('No new changes from Todoist')
      return
    }

    for (const item of data.items) {
      const existingUuid = todoistCache.get(item.id)

      if (existingUuid) {
        if (item.checked) {
          await setTaskStatus(existingUuid, 'Done')
        } else {
          await setTaskStatus(existingUuid, 'Todo')
        }
      } else {
        const createdBlk = await appendBlockWithTagAndProp(
          item.id,
          item.content,
        )
        if (createdBlk) {
          todoistCache.set(item.id, createdBlk.uuid)
        }
      }
    }
  } catch (e) {
    console.error('Sync failed', e)
  } finally {
    isInternalSync = false
  }
}
