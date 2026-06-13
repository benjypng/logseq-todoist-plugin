export const getTodoistIdPropIdent = async () => {
  const todoistIdProp = await logseq.Editor.getPage('todoistid')
  if (!todoistIdProp || !todoistIdProp.ident) {
    logseq.UI.showMsg('todoistid prop not created', 'error')
    return
  }
  return todoistIdProp.ident
}
