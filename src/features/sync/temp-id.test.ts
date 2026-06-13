import { resolveCreatedTaskId } from './temp-id'
import { describe, expect, test } from 'bun:test'

describe('resolveCreatedTaskId', () => {
  test('returns the new id even though the SDK mangles the temp_id key', () => {
    const mangledKey = '550E8400E29B41D4A716446655440000'
    const res = {
      tempIdMapping: { [mangledKey]: '99887766' },
    } as unknown as Parameters<typeof resolveCreatedTaskId>[0]

    expect(resolveCreatedTaskId(res)).toBe('99887766')
  })

  test('returns undefined when there is no mapping', () => {
    expect(resolveCreatedTaskId(null)).toBeUndefined()
    expect(
      resolveCreatedTaskId(
        {} as unknown as Parameters<typeof resolveCreatedTaskId>[0],
      ),
    ).toBeUndefined()
  })
})
