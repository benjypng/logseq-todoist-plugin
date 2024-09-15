import { TodoistApi } from '@doist/todoist-api-typescript'

import { getIdFromString, getNameFromString } from '../helpers'
import { FormInput } from './components/SendTask'

export const removeTaskFlags = (content: string): string => {
  const taskFlags = ['TODO', 'DOING', 'NOW', 'LATER', 'DONE']
  for (const f of taskFlags) {
    if (content.includes(f)) {
      content = content.replace(f, '')
    }
  }
  return content
}

export const sendTask = async ({
  task,
  project,
  label,
  priority,
  due,
  uuid,
}: FormInput) => {
  if (logseq.settings!.apiToken === '') {
    logseq.UI.showMsg('Invalid API token', 'error')
    return
  }

  const api = new TodoistApi(logseq.settings!.apiToken as string)

  const currGraph = await logseq.App.getCurrentGraph()
  const currGraphName = currGraph?.name

  try {
    await api.addTask({
      content: removeTaskFlags(task),
      description: logseq.settings!.sendAppendUri
        ? `[Link to Logseq](logseq://graph/${currGraphName}?block-id=${uuid})`
        : '',
      ...(project && { projectId: getIdFromString(project) }),
      ...(label && { labels: label.map((l) => getNameFromString(l)) }),
      ...(priority && { priority: parseInt(priority) }),
      ...(due && { dueString: due }),
    })
  } catch (error) {
    console.error(error)
    await logseq.UI.showMsg(`Task was not sent: ${(error as Error).message}`)
  }
}
