import { BlockEntity } from '@logseq/libs/dist/LSPlugin'

import { PLUGIN_PROPERTY_KEY } from '../../constants'
import { getSyncPageId, getTaskStatusFromId, getTaskTagId } from '../../utils'
import { getPageTagId } from '../../utils/get-pagetag-id'
import { api } from './api'
import { todoistCache } from './cache'
import { triggerSync } from './trigger-sync'

/*
Below is needed to track whether a new task is initiated from Logseq 
or from when it's synced from Todoist
*/
const syncLock = { isInternalSync: false }
let triggerSyncCronJob: NodeJS.Timeout

export const handleSync = () => {
  logseq.DB.onChanged(async ({ blocks }) => {
    if (syncLock.isInternalSync) return
    if (!blocks || !blocks[0] || !blocks[0].tags) return

    // Ignore if block being changed is a Page
    const pageTagId = await getPageTagId()
    // @ts-expect-error BlockEntity has not been updated
    if (blocks[0].tags.id === pageTagId) return

    // Ignore if block being changed is not on the sync page
    const syncPageId = await getSyncPageId()
    if (blocks[0].page?.id !== syncPageId) return

    // Now can identify task block with task tag id
    const taskTagId = await getTaskTagId()
    // @ts-expect-error BlockEntity has not been updated
    if (!blocks[0].tags.some((tag) => tag.id === taskTagId)) {
      return
    }

    const taskBlk = blocks[0]
    // Ignore if empty title
    if (taskBlk.title === '') return

    const todoistId = (await logseq.Editor.getBlockProperty(
      taskBlk.uuid,
      PLUGIN_PROPERTY_KEY,
    )) as BlockEntity

    if (todoistId) {
      /*
      Handle changes in task content
      */
      const content = await logseq.Editor.getEditingBlockContent()
      api.updateContent(todoistId.title, content)

      /*
      Handle changes in task status
      */
      if (taskBlk.status) {
        // @ts-expect-error BlockEntity has status property only if the status has been changed
        const taskStatusId = taskBlk.status.id as number
        const taskStatus = await getTaskStatusFromId(taskStatusId)

        // Use the todoistId we just fetched from the property
        if (taskStatus === 'Done') {
          api.setComplete(todoistId.title)
        } else {
          api.setInComplete(todoistId.title)
        }
      }
    } else {
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
  })

  logseq.App.registerCommandPalette(
    {
      key: 'todoist-plugin-trigger-todoist-sync',
      label: 'logseq-todoist-plugin: Trigger Todoist Sync',
    },
    async () => {
      await triggerSync(syncLock)
    },
  )

  logseq.App.registerCommandPalette(
    {
      key: 'todoist-plugin-start-todoist-sync',
      label: 'logseq-todoist-plugin: Start Todoist Sync Cronjob',
    },
    async () => {
      try {
        triggerSyncCronJob = setInterval(
          async () => await triggerSync(syncLock),
          1000 * 10, // 10 seconds
        )
      } catch {
        logseq.UI.showMsg('Unable to start Todoist Sync Crobjob', 'error')
      } finally {
        logseq.updateSettings({
          sync: true,
        })
        logseq.UI.showMsg('Started: Todoist Sync Cronjob', 'success')
      }
    },
  )

  logseq.App.registerCommandPalette(
    {
      key: 'todoist-plugin-stop-todoist-sync',
      label: 'logseq-todoist-plugin: Stop Todoist Sync Cronjob',
    },
    async () => {
      try {
        clearInterval(triggerSyncCronJob)
      } catch {
        logseq.UI.showMsg('Unable to stop Todoist Sync Cronjob', 'error')
      } finally {
        logseq.updateSettings({
          sync: false,
        })
        logseq.UI.showMsg('Stopped: Todoist Sync Cronjob', 'success')
      }
    },
  )
}
