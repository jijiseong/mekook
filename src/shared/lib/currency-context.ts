import { createContext, useContext } from 'react'
import type { Currency } from './currency'

export interface CurrencyContextValue {
  currency: Currency
  setCurrency: (currency: Currency) => void
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return ctx
}
