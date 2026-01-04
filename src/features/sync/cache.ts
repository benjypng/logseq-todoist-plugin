const todoistIdLogseqUuidMap = new Map<string, string>()

export const todoistCache = {
  load: async () => {
    try {
      const results = await logseq.DB.datascriptQuery(`[:find ?todoistId ?uuid
         :where
         [?b :plugin.property.logseq-todoist-plugin/todoistid ?todoistId]
         [?b :block/uuid ?uuid]]`)
      if (!results || results.length === 0) return
      todoistIdLogseqUuidMap.clear()
      for (const [blockId, logseqUuid] of results) {
        // Ensure IDs are strings to match the API response types
        const blk = await logseq.Editor.getBlock(blockId)
        if (!blk) continue
        todoistIdLogseqUuidMap.set(String(blk.content), logseqUuid)
      }
      console.info('Loaded Todoist cache', todoistIdLogseqUuidMap)
    } catch {
      console.info('Unable to load Todoist cache')
    }
  },
  get: (id: string) => {
    return todoistIdLogseqUuidMap.get(id)
  },
  set: (todoistId: string, logseqUuid: string) => {
    todoistIdLogseqUuidMap.set(String(todoistId), logseqUuid)
    console.info('Updated Todoist cache')
  },
  has: (id: string) => {
    return todoistIdLogseqUuidMap.has(id)
  },
}
