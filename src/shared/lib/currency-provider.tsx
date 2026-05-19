import { useState, type ReactNode } from 'react'
import { CurrencyContext } from './currency-context'
import { DEFAULT_CURRENCY, type Currency } from './currency'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}
