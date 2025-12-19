import { PLUGIN_PROPERTY_KEY } from '../../constants'
import { findTaskTagId } from '../../utils/add-property-to-task'
import { api } from '../../utils/api'
import { setTaskStatus } from '../../utils/set-task-status'
import { todoistCache } from './cache'

export const handleSync = () => {
  logseq.App.registerCommandPalette(
    {
      key: 'todoist-plugin-trigger-todoist-sync',
      label: 'logseq-todoist-plugin: Trigger Todoist Sync',
    },
    async () => {
      const data = await api.sync()
      if (data.items.length === 0) {
        logseq.UI.showMsg('No new changes')
        return
      }

      data.items.forEach(async (item) => {
        const existingUuid = todoistCache.get(item.id)
        if (existingUuid) {
          if (item.checked) {
            setTaskStatus(existingUuid, 'Done')
          } else {
            setTaskStatus(existingUuid, 'Todo')
          }
        } else {
          const blk = await logseq.Editor.appendBlockInPage(
            'todoist',
            item.content,
          )
          if (!blk) return
          const taskTagId = await findTaskTagId()
          if (!taskTagId) return
          await logseq.Editor.addBlockTag(blk.uuid, taskTagId)
          await logseq.Editor.upsertBlockProperty(
            blk.uuid,
            PLUGIN_PROPERTY_KEY,
            item.id,
          )
          todoistCache.set(item.id, blk.uuid)
        }
      })
    },
  )
}
