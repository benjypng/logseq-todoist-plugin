export const getTodoistIdPropIdent = async () => {
  const todoistIdProp = await logseq.Editor.getPage('todoistid')
  if (!todoistIdProp || !todoistIdProp.ident) {
    logseq.UI.showMsg('Gospel URL prop not created', 'error')
    return
  }
  return todoistIdProp.ident
}
