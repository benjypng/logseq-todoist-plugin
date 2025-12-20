import { findTaskTagUuid } from './find-tasktag-uuid'

export const addTodoistIdPropToTaskTag = async () => {
  const todoistIdProp = await logseq.Editor.getProperty('todoist-id')
  if (!todoistIdProp) {
    const todoistIdProperty = await logseq.Editor.upsertProperty('todoist-id', {
      type: 'default',
      cardinality: 'one',
      hide: true,
    })
    const taskTagId = await findTaskTagUuid()
    if (!taskTagId) return

    await logseq.Editor.addTagProperty(taskTagId, todoistIdProperty.uuid)
    console.info(`todoist-id property added to Task tag`)
  }
}
