import { getTodoistIdPropIdent } from '../../utils/get-todoistid-prop-ident'

const todoistIdLogseqUuidMap = new Map<string, string>()

// Datascript queries need the ident in keyword form (leading colon)
const asKeyword = (ident: string) =>
  ident.startsWith(':') ? ident : `:${ident}`

// Property values for user-created props are refs to value entities whose
// :block/title holds the actual string. Raw values are kept as a fallback.
const resolvePropValue = async (value: unknown) => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') {
    const valueBlk = await logseq.Editor.getBlock(value)
    if (!valueBlk) return
    return valueBlk.title ?? valueBlk.content
  }
  return
}

export const todoistCache = {
  load: async () => {
    try {
      // The todoistid prop is user-created, so its ident carries a random
      // per-graph suffix (e.g. :user.property/todoistid-E9kio) and must be
      // resolved at runtime
      const todoistIdPropIdent = await getTodoistIdPropIdent()
      if (!todoistIdPropIdent) return
      const results = await logseq.DB.datascriptQuery(`[:find ?v ?uuid
         :where
         [?b ${asKeyword(todoistIdPropIdent)} ?v]
         [?b :block/uuid ?uuid]]`)
      todoistIdLogseqUuidMap.clear()
      if (!results || results.length === 0) return
      for (const [value, logseqUuid] of results) {
        const todoistId = await resolvePropValue(value)
        if (!todoistId) continue
        todoistIdLogseqUuidMap.set(String(todoistId), String(logseqUuid))
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
  // The graph is the source of truth; the in-memory map is only a cache. On a
  // cache miss, look the id up in the graph before concluding a task is new,
  // so a stale or failed cache load can never cause duplicate blocks
  resolve: async (todoistId: string) => {
    const cached = todoistIdLogseqUuidMap.get(todoistId)
    if (cached) return cached
    try {
      const todoistIdPropIdent = await getTodoistIdPropIdent()
      if (!todoistIdPropIdent) return
      // Todoist ids are alphanumeric; strip anything that could break the EDN
      const safeId = todoistId.replace(/[^A-Za-z0-9_-]/g, '')
      const results = await logseq.DB.datascriptQuery(`[:find ?uuid
         :where
         [?v :block/title "${safeId}"]
         [?b ${asKeyword(todoistIdPropIdent)} ?v]
         [?b :block/uuid ?uuid]]`)
      if (!results || results.length === 0) return
      const logseqUuid = String(results[0][0])
      todoistIdLogseqUuidMap.set(todoistId, logseqUuid)
      return logseqUuid
    } catch {
      return
    }
  },
}
