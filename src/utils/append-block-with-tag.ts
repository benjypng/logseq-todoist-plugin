import { getTodayJournalPage } from './get-today-journal-page'
import { getTodoistTaskTagUuid } from './get-todoist-tasktag-uuid'

export const appendBlockWithTagAndProp = async (
  todoistId: string,
  task: string,
) => {
  const todayJournalPage = await getTodayJournalPage()
  if (!todayJournalPage) return

  const blk = await logseq.Editor.appendBlockInPage(todayJournalPage, task)
  if (!blk) return

  const taskTagUuid = await getTodoistTaskTagUuid()
  if (!taskTagUuid) return

  await logseq.Editor.addBlockTag(blk.uuid, taskTagUuid)
  await logseq.Editor.upsertBlockProperty(blk.uuid, 'todoist-id', todoistId)

  return blk
}
