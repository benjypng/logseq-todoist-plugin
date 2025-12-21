import { PAGE_TAG_KEY } from '../constants'

export const getPageTagId = async () => {
  const pageTag = await logseq.Editor.getTag(PAGE_TAG_KEY)
  if (!pageTag) return
  return pageTag.id
}
