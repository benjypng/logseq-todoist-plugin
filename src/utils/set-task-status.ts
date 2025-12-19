import { TASK_STATUS_KEY } from '../constants'

export const setTaskStatus = async (
  blkUuid: string,
  status: 'Todo' | 'Done',
) => {
  await logseq.Editor.upsertBlockProperty(blkUuid, TASK_STATUS_KEY, status)
}
