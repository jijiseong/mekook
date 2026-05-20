import { createServerFn } from '@tanstack/react-start'
import type { Currency } from '@/shared/lib/currency'
import type { FxRate } from '../model/types'

declare const process: { env: Record<string, string | undefined> }

interface TwelveDataQuote {
  symbol: string
  currency_base?: string
  currency_quote?: string
  close: string
  datetime: string
}

interface TwelveDataError {
  status: 'error'
  message: string
  code: number
}

function isTwelveDataError(d: unknown): d is TwelveDataError {
  return (
    !!d &&
    typeof d === 'object' &&
    'status' in d &&
    d.status === 'error' &&
    'message' in d &&
    typeof d.message === 'string'
  )
}

function isTwelveDataQuote(d: unknown): d is TwelveDataQuote {
  if (!d || typeof d !== 'object') return false
  return (
    'symbol' in d &&
    typeof d.symbol === 'string' &&
    'close' in d &&
    typeof d.close === 'string' &&
    'datetime' in d &&
    typeof d.datetime === 'string'
  )
}

const SUPPORTED_CURRENCIES = ['KRW', 'USD'] satisfies readonly Currency[]

function isCurrency(s: string): s is Currency {
  return SUPPORTED_CURRENCIES.some((c) => c === s)
}

function parseFxPair(s: string): { from: Currency; to: Currency } | null {
  const parts = s.split('/')
  if (parts.length !== 2) return null
  const [from, to] = parts
  if (!from || !to) return null
  if (!isCurrency(from) || !isCurrency(to)) return null
  return { from, to }
}

export const fetchFxRate = createServerFn({ method: 'GET' })
  .inputValidator((pair: string) => {
    const parsed = parseFxPair(pair)
    if (!parsed) {
      throw new Error(`잘못된 통화쌍 형식: ${pair}`)
    }
    return parsed
  })
  .handler(async ({ data: { from, to } }): Promise<FxRate> => {
    const apiKey = process.env.TWELVEDATA_API_KEY
    if (!apiKey) {
      throw new Error('TWELVEDATA_API_KEY 환경 변수가 설정되어 있지 않습니다.')
    }
    const pair = `${from}/${to}`
    const url = new URL('https://api.twelvedata.com/quote')
    url.searchParams.set('symbol', pair)
    url.searchParams.set('apikey', apiKey)

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Twelve Data HTTP ${res.status}`)
    }
    const json: unknown = await res.json()
    if (isTwelveDataError(json)) {
      throw new Error(`Twelve Data: ${json.message}`)
    }
    if (!isTwelveDataQuote(json)) {
      throw new Error(`예상치 못한 응답 형식: ${pair}`)
    }
    const rate = Number(json.close)
    if (!Number.isFinite(rate)) {
      throw new Error(`환율 파싱 실패: ${pair}`)
    }
    const parsedAsOf = new Date(json.datetime).getTime()
    return {
      from,
      to,
      rate,
      asOf: Number.isFinite(parsedAsOf) ? parsedAsOf : Date.now(),
    }
  })
