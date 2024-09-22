import { Task } from '@doist/todoist-api-typescript'

import { getNameFromString } from '../helpers'
import { buildRootTasks } from '.'

export const insertTasksIntoGraph = async (tasks: Task[], uuid: string) => {
  const rootTasks = await buildRootTasks(tasks)
  if (rootTasks.length === 0) {
    return
  }

  await logseq.Editor.insertBatchBlock(uuid, rootTasks, { before: true })

  if (logseq.settings!.projectNameAsParentBlk) {
    await logseq.Editor.updateBlock(
      uuid,
      getNameFromString(logseq.settings!.retrieveDefaultProject as string),
    )
  } else {
    await logseq.Editor.removeBlock(uuid)
  }
}
