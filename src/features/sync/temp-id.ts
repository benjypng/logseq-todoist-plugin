import type { SyncResponse } from '@doist/todoist-sdk'

export const resolveCreatedTaskId = (
  res: SyncResponse | null,
): string | undefined => {
  if (!res?.tempIdMapping) return undefined
  return Object.values(res.tempIdMapping)[0]
}
