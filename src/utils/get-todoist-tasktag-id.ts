import { TODOIST_TASK_TAG_KEY } from '../constants'

export const getTodoistTaskTagId = async () => {
  const taskTag = await logseq.Editor.getTag(TODOIST_TASK_TAG_KEY)
  if (!taskTag) return
  return taskTag.id
}
