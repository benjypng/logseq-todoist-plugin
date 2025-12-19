import { PLUGIN_PROPERTY_KEY } from '../../constants'
import { findTaskTagId } from '../../utils/add-property-to-task'
import { api } from '../../utils/api'
import { appendBlockWithTagAndProp } from '../../utils/append-block-with-tag'
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
          const createdBlk = await appendBlockWithTagAndProp(
            item.id,
            item.content,
          )
          if (createdBlk) {
            todoistCache.set(item.id, createdBlk.uuid)
          }
        }
      })
    },
  )
}
