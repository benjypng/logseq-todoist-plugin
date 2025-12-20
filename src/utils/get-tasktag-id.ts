import { TASK_TAG_KEY } from '../constants'

export const getTaskTagId = async () => {
  const taskTag = await logseq.Editor.getTag(TASK_TAG_KEY)
  if (!taskTag) return
  return taskTag.id
}
