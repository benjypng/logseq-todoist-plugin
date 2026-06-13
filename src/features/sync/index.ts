import { TASK_STATUS_KEY } from '../../constants'
import {
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
  logseq.updateSettings({
    ...logseq.settings,
    sync: false,
  })
  await saveInboxIdToSettings()
  await todoistCache.load()

  provideToolbarStyles()
  updateToolbarIcon(logseq.settings?.sync ? 'on' : 'off')

  logseq.DB.onChanged(async ({ blocks, txData }) => {
    if (syncLock.isInternalSync) return
    if (!blocks || blocks.length === 0) return

    const taskTagId = await getTodoistTaskTagId()
    const taskBlk = blocks.find(
      (b) =>
        Array.isArray(b?.tags) && b.tags.some((tag) => tag.id === taskTagId),
    )
    if (!taskBlk) return
    if (!taskBlk.title || taskBlk.title === '') return

    const todoistIdPropIdent = await getTodoistIdPropIdent()
    if (!todoistIdPropIdent) return

    const rawProp = await logseq.Editor.getBlockProperty(
      taskBlk.uuid,
      todoistIdPropIdent,
    )
    const propValue =
      typeof rawProp === 'string'
        ? rawProp
        : ((rawProp as Record<string, unknown> | null)?.value as
            | string
            | undefined)
    const todoistId = (propValue ?? '').trim()

    if (todoistId) {
      const attrName = (datom: (typeof txData)[number]): string =>
        String(datom[1]).replace(/^:/, '')
      const titleChanged = txData.some(
        (datom) => attrName(datom) === 'block/title',
      )
      const statusChanged = txData.some(
        (datom) => attrName(datom) === TASK_STATUS_KEY.replace(/^:/, ''),
      )

      if (titleChanged) {
        api.updateContent(todoistId, taskBlk.title)
      }

      if (statusChanged && taskBlk.status) {
        // @ts-expect-error BlockEntity has status property only if the status has been changed
        const taskStatusId = taskBlk.status.id as number
        const taskStatus = await getTaskStatusFromId(taskStatusId)

        if (taskStatus === 'Done') {
          api.setComplete(todoistId)
        } else {
          api.setInComplete(todoistId)
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
        if (triggerSyncCronJob) clearInterval(triggerSyncCronJob)
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
