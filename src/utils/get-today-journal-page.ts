import { format } from 'date-fns'

export const getTodayJournalPage = async () => {
  const { preferredDateFormat } = await logseq.App.getUserConfigs()
  const todayJournalPageName = format(new Date(), preferredDateFormat)
  const todayJournalPage = await logseq.Editor.getPage(todayJournalPageName)
  if (todayJournalPage) return todayJournalPage.name
}
