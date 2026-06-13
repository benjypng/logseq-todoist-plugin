export interface CursorPage<T> {
  results: T[]
  nextCursor: string | null
}

export const paginate = async <T>(
  fetchPage: (cursor: string | null) => Promise<CursorPage<T>>,
): Promise<T[]> => {
  const all: T[] = []
  let cursor: string | null = null
  do {
    const page = await fetchPage(cursor)
    all.push(...page.results)
    cursor = page.nextCursor
  } while (cursor !== null)
  return all
}
