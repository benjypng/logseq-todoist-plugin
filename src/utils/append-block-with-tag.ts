import { getTodayJournalPage } from './get-today-journal-page'
import { getTodoistTaskTagUuid } from './get-todoist-tasktag-uuid'
import { getTodoistIdPropIdent } from './get-todoistid-prop-ident'

const getTargetPage = async () => {
  const todayJournalPage = await getTodayJournalPage()
  if (todayJournalPage) return todayJournalPage

  const fallback = await logseq.Editor.getPage('todoisttask')
  if (fallback) return fallback.name

  const created = await logseq.Editor.createPage(
    'todoisttask',
    {},
    { createFirstBlock: false, redirect: false },
  )
  return created?.name
}

export const appendBlockWithTagAndProp = async (
  todoistId: string,
  task: string,
) => {
  const targetPage = await getTargetPage()
  if (!targetPage) return

  const taskTagUuid = await getTodoistTaskTagUuid()
  if (!taskTagUuid) return

  const blk = await logseq.Editor.appendBlockInPage(targetPage, task)
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
