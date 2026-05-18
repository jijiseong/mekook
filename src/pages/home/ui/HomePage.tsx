import { useState } from 'react'
import { ASSET_TYPES } from '@/entities/asset'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { MoneyInput } from '@/shared/ui/money-input'
import { DEFAULT_CURRENCY, type Currency } from '@/shared/lib/currency'

export function HomePage() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY)

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            mekook
          </h1>
          <p className="text-muted-foreground">
            관리할 자산 종류를 선택하세요.
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <label className="text-sm font-medium">자산 금액</label>
          <MoneyInput
            value={amount}
            currency={currency}
            onValueChange={setAmount}
            onCurrencyChange={setCurrency}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSET_TYPES.map((type) => (
            <Card
              key={type.value}
              className="cursor-pointer transition-colors hover:bg-muted/40"
            >
              <CardHeader>
                <CardTitle>{type.label}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
