export const getTodoistTaskTagId = async () => {
  const taskTag = await logseq.Editor.getPage('todoisttask')
  if (!taskTag) return
  return taskTag.id
}
