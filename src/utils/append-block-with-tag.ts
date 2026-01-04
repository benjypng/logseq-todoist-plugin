import { getTodayJournalPage } from './get-today-journal-page'
import { getTodoistTaskTagUuid } from './get-todoist-tasktag-uuid'
import { getTodoistIdPropIdent } from './get-todoistid-prop-ident'

export const appendBlockWithTagAndProp = async (
  todoistId: string,
  task: string,
) => {
  const todayJournalPage = await getTodayJournalPage()
  if (!todayJournalPage) return

  const taskTagUuid = await getTodoistTaskTagUuid()
  if (!taskTagUuid) return

  const blk = await logseq.Editor.appendBlockInPage(todayJournalPage, task)
  if (!blk) return

  await logseq.Editor.addBlockTag(blk.uuid, taskTagUuid)

  const todoistIdPropIdent = await getTodoistIdPropIdent()
  if (!todoistIdPropIdent) return

  await logseq.Editor.upsertBlockProperty(
    blk.uuid,
    todoistIdPropIdent,
    todoistId,
  )

  return blk
}
