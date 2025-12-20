import { BlockEntity } from '@logseq/libs/dist/LSPlugin'

import { PLUGIN_PROPERTY_KEY } from '../../constants'
import { api } from '../../utils/api'
import { appendBlockWithTagAndProp } from '../../utils/append-block-with-tag'
import { getTaskStatusFromId } from '../../utils/get-task-status-from-id'
import { getTaskTagId } from '../../utils/get-tasktag-id'
import { setTaskStatus } from '../../utils/set-task-status'
import { todoistCache } from './cache'

export const handleSync = () => {
  logseq.DB.onChanged(async ({ blocks }) => {
    if (!blocks || !blocks[0] || !blocks[0].tags) return

    const taskTagId = await getTaskTagId()
    if (!taskTagId) return

    // @ts-expect-error cater for BlockEntity missing tags
    if (blocks[0].tags[0].id !== taskTagId) return

    const taskBlk = blocks[0]
    if (!taskBlk || !taskBlk.title) return

    // Check if task block was created by a sync
    const pluginPropertyObj = (await logseq.Editor.getBlockProperty(
      taskBlk.uuid,
      PLUGIN_PROPERTY_KEY,
    )) as BlockEntity
    if (pluginPropertyObj) {
      // TODO: Handle if page is not 'todoist',
      // @ts-expect-error BlockEntity has not been updated yet
      const taskStatusId = taskBlk.status.id as number
      const taskStatus = await getTaskStatusFromId(taskStatusId)

      if (taskStatus === 'Done') {
        api.setComplete(pluginPropertyObj.title)
      } else {
        api.setInComplete(pluginPropertyObj.title)
      }
    } else {
      const response = await api.send(taskBlk.uuid, taskBlk.title)
      if (!response || !response.temp_id_mapping[taskBlk.uuid]) return

      const todoistId = response.temp_id_mapping[taskBlk.uuid] as string
      await logseq.Editor.upsertBlockProperty(
        taskBlk.uuid,
        PLUGIN_PROPERTY_KEY,
        todoistId,
      )

      todoistCache.set(todoistId, taskBlk.uuid)
    }
  })

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
