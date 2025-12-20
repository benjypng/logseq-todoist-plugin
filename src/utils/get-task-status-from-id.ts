export const getTaskStatusFromId = async (id: number) => {
  const page = await logseq.Editor.getPage(id)
  if (!page) return
  return page.title
}
