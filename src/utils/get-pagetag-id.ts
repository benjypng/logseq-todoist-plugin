export const getPageTagId = async () => {
  const pageTag = await logseq.Editor.getPage('todoisttask')
  if (!pageTag) return
  return pageTag.id
}
