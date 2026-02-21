import { TodoistApi } from '@doist/todoist-api-typescript'

export const getAllProjects = async (): Promise<string[]> => {
  const { apiToken } = logseq.settings!
  if (!apiToken || apiToken === '') return ['--- ---']
  const api: TodoistApi = new TodoistApi(apiToken as string)
  try {
    const allProjects = await api.getProjects()
    const projArr = allProjects.results.map(
      (project) => `${project.name} (${project.id})`,
    )
    projArr.unshift('--- ---')
    return projArr
  } catch (e) {
    console.log(e)
    await logseq.UI.showMsg(
      `Error retrieving projects ${(e as Error).message}`,
      'error',
    )
    return ['--- ---']
  }
}

export const getAllLabels = async (): Promise<string[]> => {
  const { apiToken } = logseq.settings!
  if (!apiToken || apiToken === '') return ['--- ---']
  const api: TodoistApi = new TodoistApi(apiToken as string)
  try {
    const allLabels = await api.getLabels()
    const labelArr = allLabels.results.map(
      (label) => `${label.name} (${label.id})`,
    )
    labelArr.unshift('--- ---')
    return labelArr
  } catch (e) {
    console.log(e)
    await logseq.UI.showMsg(
      `Error retrieving labels ${(e as Error).message}`,
      'error',
    )
    return ['--- ---']
  }
}

export const getIdFromString = (content: string): string => {
  const regExp = /\((.*?)\)/
  const matched = regExp.exec(content.trim())
  if (matched && matched[1]) {
    return matched[1]
  } else {
    return ''
  }
}

export const getNameFromString = (content: string): string => {
  return content.substring(0, content.indexOf('(')).trim()
}
