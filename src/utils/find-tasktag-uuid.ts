import { TASK_TAG_KEY } from '../constants'

export const findTaskTagUuid = async () => {
  const tag = await logseq.Editor.getTag(TASK_TAG_KEY)
  if (!tag) return
  return tag.uuid
}
