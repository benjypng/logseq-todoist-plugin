import { BlockEntity } from '@logseq/libs/dist/LSPlugin'

import {
  getPageTagId,
  getTaskStatusFromId,
  getTodoistTaskTagId,
  saveInboxIdToSettings,
} from '../../utils'
import { getTodoistIdPropIdent } from '../../utils/get-todoistid-prop-ident'
import { sendTaskToTodoist } from '../../utils/send-task-to-todoist'
import { api } from './api'
import { todoistCache } from './cache'
import { provideToolbarStyles, updateToolbarIcon } from './toolbar-icon'
import { triggerSync } from './trigger-sync'

/*
Below is needed to track whether a new task is initiated from Logseq
or from when it's synced from Todoist
*/
const _syncLock = { isInternalSync: false }
const syncLock = new Proxy(_syncLock, {
  set(target, prop, value) {
    const result = Reflect.set(target, prop, value)
    if (prop === 'isInternalSync') {
      if (value) {
        updateToolbarIcon('syncing')
      } else {
        updateToolbarIcon(logseq.settings?.sync ? 'on' : 'off')
      }
    }
    return result
  },
})
let triggerSyncCronJob: NodeJS.Timeout

export const handleSync = async () => {
  // Need to add sync to settings at startup first it seems
  logseq.updateSettings({
    ...logseq.settings,
    sync: false,
  })
  //NOTE: Am removing the below because plugin created tag and props don't play nicely with sync
  //await addTodoistIdPropToTaskTag()
  await saveInboxIdToSettings()
  todoistCache.load()

  provideToolbarStyles()
  updateToolbarIcon(logseq.settings?.sync ? 'on' : 'off')

  logseq.DB.onChanged(async ({ blocks }) => {
    if (syncLock.isInternalSync) return
    if (!blocks || !blocks[0] || !blocks[0].tags) return

    // Ignore if block being changed is a Page
    const pageTagId = await getPageTagId()
    // @ts-expect-error BlockEntity has not been updated
    if (blocks[0].tags.id === pageTagId) return

    // Deprecated: Ignore if block being changed is not on the sync page

    // Now can identify task block with task tag id
    const taskTagId = await getTodoistTaskTagId()
    // @ts-expect-error BlockEntity has not been updated
    if (!blocks[0].tags.some((tag) => tag.id === taskTagId)) {
      return
    }

    const taskBlk = blocks[0]
    // Ignore if empty title
    if (taskBlk.title === '') return

    const todoistIdPropIdent = await getTodoistIdPropIdent()
    if (!todoistIdPropIdent) return

    const todoistId = (await logseq.Editor.getBlockProperty(
      taskBlk.uuid,
      todoistIdPropIdent,
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

        if (taskStatus === 'Done') {
          api.setComplete(todoistId.title)
        } else {
          api.setInComplete(todoistId.title)
        }
      }
    } else {
      sendTaskToTodoist(taskBlk, syncLock)
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
          1000 * 60, // 60 seconds
        )
      } catch {
        logseq.UI.showMsg('Unable to start Todoist Sync Crobjob', 'error')
      } finally {
        logseq.updateSettings({
          sync: true,
        })
        updateToolbarIcon('on')
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
        updateToolbarIcon('off')
        logseq.UI.showMsg('Stopped: Todoist Sync Cronjob', 'success')
      }
    },
  )
}
