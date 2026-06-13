import { afterEach, describe, expect, mock, test } from 'bun:test'

const proxyRequestRaw = mock(async (_input: unknown) => '' as unknown)
class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string | undefined,
    public body: string,
  ) {
    super(statusText)
  }
}
class ProxyUnavailableError extends Error {}

mock.module('@benjypng/logseq-request', () => ({
  proxyRequestRaw,
  HttpError,
  ProxyUnavailableError,
}))

const { logseqFetch } = await import('./logseq-fetch')

afterEach(() => proxyRequestRaw.mockReset())

describe('logseqFetch', () => {
  test('success returns ok response with parsed json', async () => {
    proxyRequestRaw.mockResolvedValueOnce(JSON.stringify({ a: 1 }))
    const res = await logseqFetch('https://api/x', {
      method: 'POST',
      body: JSON.stringify({ q: 1 }),
    })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ a: 1 })
  })

  test('parses string body into object for the proxy', async () => {
    proxyRequestRaw.mockResolvedValueOnce('{}')
    await logseqFetch('https://api/x', {
      method: 'POST',
      body: JSON.stringify({ q: 2 }),
    })
    expect(proxyRequestRaw.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      body: { q: 2 },
    })
  })

  test('HttpError maps to non-ok response', async () => {
    proxyRequestRaw.mockRejectedValueOnce(
      new HttpError(404, 'Not Found', JSON.stringify({ error: 'x' })),
    )
    const res = await logseqFetch('https://api/x', { method: 'GET' })
    expect(res.ok).toBe(false)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'x' })
  })

  test('ProxyUnavailableError propagates', async () => {
    proxyRequestRaw.mockRejectedValueOnce(new ProxyUnavailableError('down'))
    await expect(logseqFetch('https://api/x')).rejects.toBeInstanceOf(
      ProxyUnavailableError,
    )
  })

  test('non-JSON body is omitted (not forwarded)', async () => {
    proxyRequestRaw.mockResolvedValueOnce('')
    const res = await logseqFetch('https://api/x', {
      method: 'POST',
      body: 'not json',
    })
    expect(res.ok).toBe(true)
    expect(proxyRequestRaw.mock.calls[0][0].body).toBeUndefined()
  })

  test('defaults to GET with no body when options omitted', async () => {
    proxyRequestRaw.mockResolvedValueOnce('{}')
    await logseqFetch('https://api/x')
    expect(proxyRequestRaw.mock.calls[0][0]).toMatchObject({ method: 'GET' })
    expect(proxyRequestRaw.mock.calls[0][0].body).toBeUndefined()
  })

  test('passes headers through to the proxy', async () => {
    proxyRequestRaw.mockResolvedValueOnce('{}')
    await logseqFetch('https://api/x', {
      method: 'GET',
      headers: { Authorization: 'Bearer t' },
    })
    expect(proxyRequestRaw.mock.calls[0][0].headers).toEqual({
      Authorization: 'Bearer t',
    })
  })

  test('text() returns the raw body string', async () => {
    proxyRequestRaw.mockResolvedValueOnce('plain-body')
    const res = await logseqFetch('https://api/x', { method: 'GET' })
    expect(await res.text()).toBe('plain-body')
  })
})
