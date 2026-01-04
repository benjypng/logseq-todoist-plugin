export const getTodoistTaskTagUuid = async () => {
  const taskTag = await logseq.Editor.getPage('todoisttask')
  if (!taskTag) return
  return taskTag.uuid
}
