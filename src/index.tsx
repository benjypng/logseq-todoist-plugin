import '@logseq/libs'

import { createRoot } from 'react-dom/client'

import { getAllLabels, getAllProjects } from './features/helpers'
import { retrieveTasks } from './features/retrieve'
import { insertTasksIntoGraph } from './features/retrieve/insert-tasks-into-graph'
import { sendTask } from './features/send'
import { SendTask } from './features/send/components/SendTask'
import handleListeners from './handleListeners'
import { callSettings } from './settings'

const main = async () => {
  console.log('logseq-todoist-plugin loaded')
  handleListeners()

  if (logseq.settings!.apiToken === '') {
    // Check if it's a new install
    await logseq.UI.showMsg(
      'Please key in your API key before using the plugin',
      'error',
    )
  }
  const projects = await getAllProjects()
  const labels = await getAllLabels()
  callSettings(projects, labels)

  // const templates = await logseq.App.getCurrentGraphTemplates()
  // console.log('Templates', templates)

  // RETRIEVE TASKS
  logseq.Editor.registerSlashCommand('Todoist: Retrieve Tasks', async (e) => {
    const tasks = await retrieveTasks('default')
    if (tasks.length > 0) await insertTasksIntoGraph(tasks, e.uuid)
  })

  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Today's Tasks",
    async (e) => {
      const tasks = await retrieveTasks('today')
      if (tasks.length > 0) await insertTasksIntoGraph(tasks, e.uuid)
    },
  )

  logseq.Editor.registerSlashCommand(
    'Todoist: Retrieve Custom Filter',
    async (e) => {
      const content = await logseq.Editor.getEditingBlockContent()
      if (content.length === 0) {
        logseq.UI.showMsg('Cannot retrieve with empty filter', 'error')
        return
      }
      const tasks = await retrieveTasks('custom', content)
      if (tasks.length > 0) {
        await logseq.Editor.updateBlock(e.uuid, '') // Clear block first since it contains the filter
        await insertTasksIntoGraph(tasks, e.uuid)
      }
    },
  )

  // AUTO-IMPORT FUNCTIONALITY
  let autoImportInterval: NodeJS.Timeout | null = null
  let lastImportBlockUuid: string | null = null

  async function performAutoImport() {
    try {
      const pageName = (logseq.settings?.autoImportPage as string)|| 'todolist'
      console.log(`Auto-importing Todoist tasks to page: ${pageName}`)
      
      // Get or create the page
      let page = await logseq.Editor.getPage(pageName)
      if (!page) {
        await logseq.Editor.createPage(pageName)
        page = await logseq.Editor.getPage(pageName)
      }
      
      // Retrieve tasks first
      const tasks = await retrieveTasks('default')
      
      if (!tasks || tasks.length === 0) {
        await logseq.UI.showMsg('ℹ️ No Todoist tasks found', 'info')
        return
      }

      // Check if we have a previous import block
      if (lastImportBlockUuid) {
        // Try to get the existing block
        const existingBlock = await logseq.Editor.getBlock(lastImportBlockUuid)
        
        if (existingBlock) {
          // Delete the entire old block and create a new one
          // This is simpler and more reliable than trying to update in place
          await logseq.Editor.removeBlock(lastImportBlockUuid)
          lastImportBlockUuid = null
        }
      }

      // Always create a fresh block
      const timestamp = new Date().toLocaleString()
      const newBlock = await logseq.Editor.appendBlockInPage(
        pageName,
        `📥 Todoist Auto Import - ${timestamp}`
      )
      
      if (!newBlock) {
        throw new Error('Failed to create import block')
      }
      
      const targetBlockUuid = newBlock.uuid
      lastImportBlockUuid = newBlock.uuid
      
      // Insert tasks into the block
      await insertTasksIntoGraph(tasks, targetBlockUuid)
      await logseq.UI.showMsg('✅ Todoist tasks imported automatically!', 'success')
      console.log(`Successfully imported ${tasks.length} tasks`)
      
    } catch (error) {
      console.error('Auto-import error:', error)
      await logseq.UI.showMsg('❌ Failed to auto-import Todoist tasks', 'error')
    }
  }

  function schedulePeriodicImport() {
    const isEnabled = logseq.settings?.enableAutoImport
    if (!isEnabled) {
      console.log('Auto-import is disabled')
      return
    }
      
    // Clear any existing interval
    if (autoImportInterval) {
      clearInterval(autoImportInterval)
      autoImportInterval = null
    }
    
    // Get interval in minutes from settings (default: 2 minutes)
    const intervalMinutes = parseInt(String(logseq.settings?.autoImportInterval || '2')) || 2
    const intervalMs = intervalMinutes * 60 * 1000
    
    console.log(`Todoist auto-import will run every ${intervalMinutes} minute(s)`)
    
    autoImportInterval = setInterval(() => {
      if (logseq.settings?.enableAutoImport) {
        performAutoImport()
      } else {
        // If disabled, clear the interval
        if (autoImportInterval) {
          clearInterval(autoImportInterval)
          autoImportInterval = null
        }
      }
    }, intervalMs)
  }

  // Manual trigger command
  logseq.Editor.registerSlashCommand('Todoist: Auto Import Now', async () => {
    await performAutoImport()
  })

  // Start scheduler when plugin initializes
  setTimeout(() => {
    if (logseq.settings?.enableAutoImport) {
      schedulePeriodicImport()
      const intervalMinutes = parseInt(String(logseq.settings?.autoImportInterval || '2')) || 2
      logseq.UI.showMsg(`🤖 Todoist auto-import started (every ${intervalMinutes} min)`, 'success')
      // Run immediately on start
      performAutoImport()
    }
  }, 2000) // Wait 2 seconds for settings to load


  // Re-schedule when settings change
  logseq.onSettingsChanged((newSettings, oldSettings) => {
    // If auto-import is enabled
    if (newSettings.enableAutoImport) {
      // If it was just enabled or interval changed, restart scheduler
      if (!oldSettings.enableAutoImport || newSettings.autoImportInterval !== oldSettings.autoImportInterval) {
        schedulePeriodicImport()
        const intervalMinutes = parseInt(String(newSettings.autoImportInterval || '2')) || 2
        logseq.UI.showMsg(`🤖 Todoist auto-import enabled (every ${intervalMinutes} min)`, 'success')
        // Run immediately when enabled or interval changes
        performAutoImport()
      }
    } else if (!newSettings.enableAutoImport && oldSettings.enableAutoImport) {
      // If disabled, clear the interval
      if (autoImportInterval) {
        clearInterval(autoImportInterval)
        autoImportInterval = null
      }
      logseq.UI.showMsg('🤖 Todoist auto-import disabled', 'info')
    }
  })
  // till here new changes.

  // SEND TASKS
  const el = document.getElementById('app')
  if (!el) return
  const root = createRoot(el)

  logseq.Editor.registerSlashCommand(
    'Todoist: Send Task (manual)',
    async (e) => {
      const content = await logseq.Editor.getEditingBlockContent()
      if (content.length === 0) {
        logseq.UI.showMsg('Unable to send empty task', 'error')
        return
      }
      const msgKey = await logseq.UI.showMsg(
        'Getting projects and labels',
        'success',
      )
      const allProjects = await getAllProjects()
      const allLabels = await getAllLabels()
      logseq.UI.closeMsg(msgKey)

      root.render(
        <SendTask
          key={e.uuid}
          content={content}
          projects={allProjects}
          labels={allLabels}
          uuid={e.uuid}
        />,
      )
      logseq.showMainUI()
    },
  )

  logseq.Editor.registerSlashCommand('Todoist: Send Task', async (e) => {
    const content = await logseq.Editor.getEditingBlockContent()
    if (content.length === 0) {
      logseq.UI.showMsg('Unable to send empty task', 'error')
      return
    }

    // If default project set, don't show popup
    if (logseq.settings!.sendDefaultProject !== '--- ---') {
      await sendTask({
        task: content,
        project: logseq.settings!.sendDefaultProject as string,
        label: [logseq.settings!.sendDefaultLabel as string],
        due: logseq.settings!.sendDefaultDeadline ? 'today' : '',
        priority: '1',
        uuid: e.uuid,
      })
    } else {
      // If no default project set, show popup
      const msgKey = await logseq.UI.showMsg(
        'Getting projects and labels',
        'success',
      )
      const allProjects = await getAllProjects()
      const allLabels = await getAllLabels()
      logseq.UI.closeMsg(msgKey)

      root.render(
        <SendTask
          key={e.uuid}
          content={content}
          projects={allProjects}
          labels={allLabels}
          uuid={e.uuid}
        />,
      )
      logseq.showMainUI()
    }
  })
}

logseq.ready(main).catch(console.error)
