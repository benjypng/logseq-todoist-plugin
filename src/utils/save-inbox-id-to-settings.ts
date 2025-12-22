import { api } from '../features/sync/api'

export const saveInboxIdToSettings = async () => {
  const userInboxId = await api.getInboxId()

  logseq.updateSettings({
    ...logseq.settings,
    userInboxId,
  })

  console.info(`User Inbox ID (${userInboxId}) saved to settings`)
}
