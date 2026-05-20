import { queryOptions } from '@tanstack/react-query'
import type { Currency } from '@/shared/lib/currency'
import { fetchFxRate } from './fx-rate'

export const fxRateQueryOptions = (from: Currency, to: Currency) =>
  queryOptions({
    queryKey: ['fx-rate', from, to],
    queryFn: () => fetchFxRate({ data: `${from}/${to}` }),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: from !== to,
  })
