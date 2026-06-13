import type { Task } from '@doist/todoist-sdk'
import { getDateForPage, getDeadlineDateDay } from 'logseq-dateutils'

import { getIdFromString } from '../helpers'
import { paginate } from '../sync/paginate'
import { getTodoistApi } from '../sync/todoist-client'

interface TaskBlock {
  content: string
  children: TaskBlock[]
  properties: {
    todoistid?: string
    comments?: string
    attachments?: string
    due?: string
  }
}

export const handleComments = async (id: string) => {
  const api = getTodoistApi()
  const comments = await paginate((cursor) =>
    api.getComments({ taskId: id, cursor }),
  )
  if (comments.length === 0) return {}

  const textComments = comments
    .filter((comment) => !comment.fileAttachment)
    .map((comment) => comment.content)
    .join(', ')
  const attachments = comments
    .filter((comment) => comment.fileAttachment)
    .map((comment) => {
      const { fileUrl, fileName } = comment.fileAttachment!
      return `[${fileName}](${fileUrl})`
    })
    .join(', ')

  return {
    comments: textComments,
    attachments,
  }
}

export const buildRootTasks = async (tasks: Task[]) => {
  const taskMap: Record<string, TaskBlock> = {}

  try {
    await Promise.all(
      tasks.map(async (task) => {
        const comments = await handleComments(task.id)

        // Handle due date
        let content = task.due
          ? `${task.content}
${getDeadlineDateDay(new Date(task.due.date))}`
          : task.content

        // Handle append todo
        content = logseq.settings!.retrieveAppendTodo
          ? `TODO ${content}`
          : content

        // Handle append tags
        content = logseq.settings!.retrieveAppendLabels
          ? `${content}${task.labels
              .map((l) => {
                return ` [[${l}]]`
              })
              .join(' ')}`
          : content

        // Handle created at
        const preferredDateFormat = (await logseq.App.getUserConfigs())
          .preferredDateFormat
        const createdDate = getDateForPage(
          new Date(task.addedAt!),
          preferredDateFormat,
        )

        taskMap[task.id] = {
          content: content,
          children: [],
          properties: {
            ...(logseq.settings!.retrieveAppendCreationDateTime! && {
              created: createdDate,
            }),
            ...(logseq.settings!.appendTodoistId! && { todoistid: task.id }),
            ...(comments.comments && { comments: comments.comments }),
            ...(comments.attachments && { attachments: comments.attachments }),
          },
        }
      }),
    )

    const rootTasks: TaskBlock[] = []
    tasks.forEach((task) => {
      const taskBlock = taskMap[task.id]
      if (task.parentId === null) {
        if (!taskBlock) return
        rootTasks.push(taskBlock)
      } else {
        const parentTask = taskMap[task.parentId!]
        if (parentTask) {
          if (!taskBlock) return
          parentTask.children.push(taskBlock)
        }
      }
    })

    return rootTasks
  } catch (error) {
    console.error(error)
    logseq.UI.showMsg('Unable to build root tasks', 'error')
    return []
  }
}

export const deleteAllTasks = async (tasksArr: Task[]) => {
  const api = getTodoistApi()
  try {
    for (const task of tasksArr) {
      await api.deleteTask(task.id)
    }
  } catch (e) {
    logseq.UI.showMsg(`Error deleting tasks: ${(e as Error).message}`, 'error')
    return
  }
}

export const retrieveTasks = async (
  taskParams: 'default' | 'today' | 'custom',
  customFilter?: string,
) => {
  const msgKey = await logseq.UI.showMsg('Getting tasks...')

  const api = getTodoistApi()

  // Insert blocks
  let allTasks: Task[] = []

  try {
    switch (taskParams) {
      case 'default': {
        if (logseq.settings!.retrieveDefaultProject === '--- ---') {
          await logseq.UI.showMsg('Please select a default project', 'error')
          return []
        }
        const tasks = await paginate((cursor) =>
          api.getTasks({
            projectId: getIdFromString(
              logseq.settings!.retrieveDefaultProject as string,
            ),
            cursor,
          }),
        )
        allTasks = [...allTasks, ...tasks]
        break
      }

      case 'today': {
        const tasks = await paginate((cursor) =>
          api.getTasksByFilter({ query: 'today', cursor }),
        )
        allTasks = [...allTasks, ...tasks]
        break
      }

      case 'custom': {
        const tasks = await paginate((cursor) =>
          api.getTasksByFilter({ query: customFilter!, cursor }),
        )
        allTasks = [...allTasks, ...tasks]
        break
      }

      default:
        break
    }

    if (logseq.settings!.retrieveClearTasks) {
      await deleteAllTasks(allTasks)
    }

    logseq.UI.closeMsg(msgKey)

    return allTasks
  } catch (error) {
    console.log(error)
    logseq.UI.showMsg(`Error: ${(error as Error).message}`, 'error')
    return []
  }
}
