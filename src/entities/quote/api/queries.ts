import { queryOptions } from '@tanstack/react-query'
import { fetchQuote } from './quote'

export const quoteQueryOptions = (symbol: string) =>
  queryOptions({
    queryKey: ['quote', symbol],
    queryFn: () => fetchQuote({ data: symbol }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: symbol.length > 0,
  })
