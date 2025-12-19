import { TASK_TAG_KEY } from '../constants'

export const findTaskTagId = async () => {
  const tag = await logseq.Editor.getTag(TASK_TAG_KEY)
  if (!tag) return
  return tag.uuid
}

export const addTodoistIdPropToTaskTag = async () => {
  const todoistIdProp = await logseq.Editor.getProperty('todoist-id')
  if (!todoistIdProp) {
    const todoistIdProperty = await logseq.Editor.upsertProperty('todoist-id', {
      type: 'default',
      cardinality: 'one',
      hide: true,
    })
    const taskTagId = await findTaskTagId()
    if (!taskTagId) return

    await logseq.Editor.addTagProperty(taskTagId, todoistIdProperty.uuid)
    console.info(`todoist-id property added to Task tag`)
  }
}
