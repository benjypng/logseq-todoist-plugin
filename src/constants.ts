import { createTheme } from '@mantine/core'

export const THEME = createTheme({
  primaryColor: 'darkTeal',
  primaryShade: 9,
  colors: {
    darkTeal: [
      '#ecfbfd',
      '#daf4f8',
      '#b0e8f2',
      '#85dded',
      '#66d3e9',
      '#56cde6',
      '#4ccae6',
      '#3eb2cd',
      '#2f9eb7',
      '#0d89a0',
    ],
  },
})

export const PLUGIN_PROPERTY_KEY =
  ':plugin.property.logseq-todoist-plugin/todoist-id'

export const TASK_TAG_KEY = ':logseq.class/Task'

export const TASK_STATUS_KEY = ':logseq.property/status'
