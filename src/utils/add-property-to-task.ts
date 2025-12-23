import { getTaskTagUuid } from './get-tasktag-uuid'

export const addTodoistIdPropToTaskTag = async () => {
  const todoistIdProp = await logseq.Editor.getPage('todoist-id')
  if (!todoistIdProp) {
    const todoistTaskTag = await logseq.Editor.createTag('TodoistTask')
    if (!todoistTaskTag) return
    console.info('Created TodoistTask tag')

    const taskTagUuid = await getTaskTagUuid()
    if (!taskTagUuid) return

    await logseq.Editor.addTagExtends(todoistTaskTag.uuid, taskTagUuid)

    const todoistIdProperty = await logseq.Editor.upsertProperty('todoist-id', {
      type: 'default',
      cardinality: 'one',
    })
    await logseq.Editor.addTagProperty(
      todoistTaskTag.uuid,
      todoistIdProperty.uuid,
    )
    console.info(`todoist-id property added to Task tag`)
  }
}
