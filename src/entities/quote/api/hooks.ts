import { useQuery } from '@tanstack/react-query'
import { quoteQueryOptions } from './queries'

export const useQuote = (symbol: string) => useQuery(quoteQueryOptions(symbol))
