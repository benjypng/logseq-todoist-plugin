import { PLUGIN_PROPERTY_KEY } from '../constants'
import { findTaskTagUuid } from './find-tasktag-uuid'
import { getTodayJournalPage } from './get-today-journal-page'

export const appendBlockWithTagAndProp = async (
  todoistId: string,
  task: string,
) => {
  const todayJournalPage = await getTodayJournalPage()
  if (!todayJournalPage) return

  const blk = await logseq.Editor.appendBlockInPage(todayJournalPage, task)
  if (!blk) return

  const taskTagId = await findTaskTagUuid()
  if (!taskTagId) return

  await logseq.Editor.addBlockTag(blk.uuid, taskTagId)
  await logseq.Editor.upsertBlockProperty(
    blk.uuid,
    PLUGIN_PROPERTY_KEY,
    todoistId,
  )

  return blk
}
