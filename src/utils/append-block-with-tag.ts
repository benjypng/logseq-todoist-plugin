import { PLUGIN_PROPERTY_KEY } from '../constants'
import { findTaskTagId } from './add-property-to-task'

export const appendBlockWithTagAndProp = async (
  todoistId: string,
  task: string,
) => {
  const blk = await logseq.Editor.appendBlockInPage('todoist', task)
  if (!blk) return

  const taskTagId = await findTaskTagId()
  if (!taskTagId) return

  await logseq.Editor.addBlockTag(blk.uuid, taskTagId)
  await logseq.Editor.upsertBlockProperty(
    blk.uuid,
    PLUGIN_PROPERTY_KEY,
    todoistId,
  )

  return blk
}
