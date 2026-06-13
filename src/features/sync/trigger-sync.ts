import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { SyncLock } from '../../interfaces'
import { appendBlockWithTagAndProp, setTaskStatus } from '../../utils'
import { getTodoistIdPropIdent } from '../../utils/get-todoistid-prop-ident'
import { sendTaskToTodoist } from '../../utils/send-task-to-todoist'
import { api } from './api'
import { todoistCache } from './cache'
import { updateToolbarIcon } from './toolbar-icon'

export const triggerSync = async (syncLock: SyncLock) => {
  if (syncLock.isInternalSync) return // Handle race condition
  syncLock.isInternalSync = true

  try {
    // Handle tasks from Todoist
    const data = await api.sync()
    if (!data) return
    let allItemsApplied = true
    for (const item of data.items) {
      try {
        if (item.content === '') continue
        if (item.project_id !== logseq.settings?.userInboxId) continue

        if (item.is_deleted) continue

        const desiredStatus = item.checked ? 'Done' : 'Todo'

        let existingUuid = await todoistCache.resolve(item.id)

        if (existingUuid) {
          const existingBlk = await logseq.Editor.getBlock(existingUuid)
          if (!existingBlk) {
            todoistCache.delete(item.id)
            existingUuid = undefined
          }
        }

        if (existingUuid) {
          await setTaskStatus(existingUuid, desiredStatus)
        } else {
          const createdBlk = await appendBlockWithTagAndProp(
            item.id,
            item.content,
          )
          if (createdBlk) {
            todoistCache.set(item.id, createdBlk.uuid)
            if (item.checked) {
              await setTaskStatus(createdBlk.uuid, 'Done')
            }
          } else {
            allItemsApplied = false
            console.error(
              new Date().toISOString(),
              `Todoist Sync: Unable to create block for item ${item.id}`,
            )
          }
        }
      } catch (e) {
        allItemsApplied = false
        console.error(
          new Date().toISOString(),
          `Todoist Sync: Failed to apply item ${item.id}`,
          e,
        )
      }
    }
    if (allItemsApplied) {
      logseq.updateSettings({
        syncToken: data.sync_token,
      })
    }

    // Handle tasks created on mobile
    const tasksTaggedWithTodoistTask: BlockEntity[][] =
      await logseq.DB.datascriptQuery(`
      [:find (pull ?b [*])
      :where
      [?p :block/name "todoisttask"]
      [?b :block/refs ?p]]`)
    if (tasksTaggedWithTodoistTask.length === 0) return
    const todoistIdPropIdent = await getTodoistIdPropIdent()
    if (!todoistIdPropIdent) return
    const todoistTasksWithoutTodoistId = tasksTaggedWithTodoistTask
      .map((blockArr) => blockArr[0])
      .filter(
        (block) =>
          !block![todoistIdPropIdent] &&
          !block![':logseq.property.view/feature-type'],
      )
    if (todoistTasksWithoutTodoistId.length === 0) return
    for (const taskBlk of todoistTasksWithoutTodoistId) {
      if (!taskBlk) continue
      sendTaskToTodoist(taskBlk, syncLock)
    }
  } catch (e) {
    console.error(new Date().toISOString(), 'Todoist Sync: Failed', e)
    updateToolbarIcon('error')
  } finally {
    syncLock.isInternalSync = false
    console.info(new Date().toISOString(), 'Todoist Sync: Completed')
  }
}
