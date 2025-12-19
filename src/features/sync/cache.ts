const todoistIdLogseqUuidMap = new Map<string, string>()

export const todoistCache = {
  load: async () => {
    try {
      const results = await logseq.DB.datascriptQuery(`[:find ?todoistId ?uuid
         :where
         [?b :plugin.property.logseq-todoist-plugin/todoist-id ?todoistId]
         [?b :block/uuid ?uuid]]`)
      if (!results || results.length === 0) return
      todoistIdLogseqUuidMap.clear()
      for (const [blockId, logseqUuid] of results) {
        // Ensure IDs are strings to match the API response types
        const blk = await logseq.Editor.getBlock(blockId)
        if (!blk) continue
        todoistIdLogseqUuidMap.set(String(blk.content), logseqUuid)
      }
      logseq.UI.showMsg('Loaded Todoist cache')
    } catch {
      logseq.UI.showMsg('Unable to load Todoist cache')
    }
  },

  get: (todoistId: string) => {
    return todoistIdLogseqUuidMap.get(todoistId)
  },
  set: (todoistId: string, logseqUuid: string) => {
    todoistIdLogseqUuidMap.set(String(todoistId), logseqUuid)
    logseq.UI.showMsg('Updated Todoist cache')
  },
  has: (todoistId: string) => {
    return todoistIdLogseqUuidMap.has(todoistId)
  },
}
