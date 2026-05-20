import { createServerFn } from '@tanstack/react-start'
import type { Quote } from '../model/types'

// Server fn 핸들러는 Node 런타임에서만 실행. 클라이언트 번들에는 포함되지 않으므로
// 전역 process 타입을 모듈 스코프에 한정해 선언한다 (@types/node를 lib에 추가하지 않기 위함).
declare const process: { env: Record<string, string | undefined> }

interface TwelveDataQuote {
  symbol: string
  currency: string
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
    'currency' in d &&
    typeof d.currency === 'string' &&
    'close' in d &&
    typeof d.close === 'string' &&
    'datetime' in d &&
    typeof d.datetime === 'string'
  )
}

export const fetchQuote = createServerFn({ method: 'GET' })
  .inputValidator((symbol: string) => symbol)
  .handler(async ({ data: symbol }): Promise<Quote> => {
    const apiKey = process.env.TWELVEDATA_API_KEY
    if (!apiKey) {
      throw new Error('TWELVEDATA_API_KEY 환경 변수가 설정되어 있지 않습니다.')
    }
    const url = new URL('https://api.twelvedata.com/quote')
    url.searchParams.set('symbol', symbol)
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
      throw new Error(`예상치 못한 응답 형식: ${symbol}`)
    }
    const price = Number(json.close)
    if (!Number.isFinite(price)) {
      throw new Error(`가격 파싱 실패: ${symbol}`)
    }
    const parsedAsOf = new Date(json.datetime).getTime()
    return {
      symbol: json.symbol,
      price,
      currency: json.currency,
      asOf: Number.isFinite(parsedAsOf) ? parsedAsOf : Date.now(),
    }
  })
