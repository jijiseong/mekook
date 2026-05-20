import { useQuery } from '@tanstack/react-query'
import type { Currency } from '@/shared/lib/currency'
import { fxRateQueryOptions } from './queries'

export interface UseFxRateResult {
  rate: number | undefined
  isLoading: boolean
  error: Error | null
}

export function useFxRate(from: Currency, to: Currency): UseFxRateResult {
  const query = useQuery(fxRateQueryOptions(from, to))
  if (from === to) {
    return { rate: 1, isLoading: false, error: null }
  }
  return {
    rate: query.data?.rate,
    isLoading: query.isLoading,
    error: query.error,
  }
}
