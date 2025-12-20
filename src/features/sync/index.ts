import { BlockEntity } from '@logseq/libs/dist/LSPlugin'

import { PLUGIN_PROPERTY_KEY } from '../../constants'
import { api } from '../../utils/api'
import { appendBlockWithTagAndProp } from '../../utils/append-block-with-tag'
import { getTaskStatusFromId } from '../../utils/get-task-status-from-id'
import { getTaskTagId } from '../../utils/get-tasktag-id'
import { setTaskStatus } from '../../utils/set-task-status'
import { todoistCache } from './cache'

/*
Below is needed to track whether a new task is initiated from Logseq 
or from when it's synced from Todoist
*/
let isInternalSync = false

export const handleSync = () => {
  logseq.DB.onChanged(async ({ blocks }) => {
    if (isInternalSync) return
    if (!blocks || !blocks[0] || !blocks[0].tags) return

    const taskTagId = await getTaskTagId()
    if (!taskTagId) return

    // @ts-expect-error cater for BlockEntity missing tags
    if (blocks[0].tags[0].id !== taskTagId) return

    const taskBlk = blocks[0]
    if (!taskBlk || !taskBlk.title) return

    const todoistId = (await logseq.Editor.getBlockProperty(
      taskBlk.uuid,
      PLUGIN_PROPERTY_KEY,
    )) as BlockEntity

    if (todoistId) {
      // @ts-expect-error BlockEntity has not been updated yet
      const taskStatusId = taskBlk.status.id as number
      const taskStatus = await getTaskStatusFromId(taskStatusId)

      // Use the todoistId we just fetched from the property
      if (taskStatus === 'Done') {
        api.setComplete(todoistId.title)
      } else {
        api.setInComplete(todoistId.title)
      }
    } else {
      const response = await api.send(taskBlk.uuid, taskBlk.title)
      if (!response || !response.temp_id_mapping[taskBlk.uuid]) return

      const newTodoistId = response.temp_id_mapping[taskBlk.uuid] as string

      try {
        isInternalSync = true
        await logseq.Editor.upsertBlockProperty(
          taskBlk.uuid,
          PLUGIN_PROPERTY_KEY,
          newTodoistId,
        )
      } finally {
        isInternalSync = false
      }

      todoistCache.set(newTodoistId, taskBlk.uuid)
    }
  })

  logseq.App.registerCommandPalette(
    {
      key: 'todoist-plugin-trigger-todoist-sync',
      label: 'logseq-todoist-plugin: Trigger Todoist Sync',
    },
    async () => {
      isInternalSync = true

      try {
        const data = await api.sync()
        if (data.items.length === 0) {
          logseq.UI.showMsg('No new changes')
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
    },
  )
}
