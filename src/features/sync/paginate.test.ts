import { paginate } from './paginate'
import { describe, expect, test } from 'bun:test'

describe('paginate', () => {
  test('follows nextCursor across pages', async () => {
    const pages: Record<
      string,
      { results: number[]; nextCursor: string | null }
    > = {
      null: { results: [1, 2], nextCursor: 'c1' },
      c1: { results: [3], nextCursor: null },
    }
    const out = await paginate<number>(async (cursor) => pages[String(cursor)])
    expect(out).toEqual([1, 2, 3])
  })

  test('single page returns its results', async () => {
    const out = await paginate<number>(async () => ({
      results: [9],
      nextCursor: null,
    }))
    expect(out).toEqual([9])
  })
})
