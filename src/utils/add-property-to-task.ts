export const checkIfTodoistIdPropCreated = async (): Promise<boolean> => {
  const allProps = await logseq.Editor.getAllProperties()
  if (!allProps) return false
  const todoistIdProp = allProps.filter((prop) =>
    prop.ident?.includes(':plugin.property.logseq-todoist-plugin/todoist-id'),
  )
  if (!todoistIdProp || todoistIdProp.length === 0) {
    return false
  } else {
    return true
  }
}

export const addTodoistIdPropToTaskTag = async () => {
  if (await checkIfTodoistIdPropCreated()) {
    const todoistIdProperty = await logseq.Editor.upsertProperty('todoist-id', {
      type: 'default',
      cardinality: 'one',
      hide: true,
    })
    await logseq.Editor.addTagProperty('Task', todoistIdProperty.uuid)
    console.info(`todoist-id property added to Task tag`)
  }
}
