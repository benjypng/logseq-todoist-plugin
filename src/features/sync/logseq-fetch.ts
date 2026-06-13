import {
  HttpError,
  type HttpMethod,
  proxyRequestRaw,
} from '@benjypng/logseq-request'
import type { CustomFetch, CustomFetchResponse } from '@doist/todoist-sdk'

const normalizeHeaders = (
  h: HeadersInit | undefined,
): Record<string, string> => {
  if (!h) return {}
  if (h instanceof Headers) {
    const out: Record<string, string> = {}
    h.forEach((v, k) => {
      out[k] = v
    })
    return out
  }
  if (Array.isArray(h)) return Object.fromEntries(h)
  return h as Record<string, string>
}

const parseBody = (body: unknown): object | undefined => {
  if (typeof body !== 'string' || body.length === 0) return undefined
  try {
    return JSON.parse(body) as object
  } catch {
    return undefined
  }
}

const makeResponse = (
  ok: boolean,
  status: number,
  statusText: string,
  body: unknown,
): CustomFetchResponse => ({
  ok,
  status,
  statusText,
  headers: {},
  text: async () => {
    if (body == null) return ''
    return typeof body === 'string' ? body : JSON.stringify(body)
  },
  json: async () => {
    if (typeof body === 'string') return body.length ? JSON.parse(body) : null
    return body ?? null
  },
})

export const logseqFetch: CustomFetch = async (url, options) => {
  const method = (options?.method ?? 'GET').toUpperCase() as HttpMethod
  const headers = normalizeHeaders(options?.headers)
  const body =
    typeof options?.body === 'string' ? parseBody(options.body) : undefined

  try {
    const raw = await proxyRequestRaw({
      url,
      method,
      headers,
      body,
      timeoutMs: options?.timeout,
    })
    return makeResponse(true, 200, 'OK', raw)
  } catch (e) {
    if (e instanceof HttpError) {
      return makeResponse(false, e.status, e.statusText ?? '', e.body)
    }
    throw e
  }
}
