export const getSyncPageId = async () => {
  const pageTitle = (logseq.settings?.syncPage as string) ?? 'Todoist Sync'
  const page = await logseq.Editor.getPage(pageTitle)
  if (!page) {
    const createdPage = await logseq.Editor.createPage(pageTitle)
    if (!createdPage) return
    return createdPage.id
  } else {
    return page.id
  }
}
