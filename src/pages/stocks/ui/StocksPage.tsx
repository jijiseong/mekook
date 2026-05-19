import { Link } from '@tanstack/react-router'
import { CurrencyProvider } from '@/shared/lib/currency-provider'
import { CurrencyToggle } from '@/shared/ui/currency-toggle'
import { Button } from '@/shared/ui/button'
import { StockTargetSection } from './stock-target-section'
import { StockHoldingsSection } from './stock-holdings-section'

export function StocksPage() {
  return (
    <CurrencyProvider>
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
                <Link to="/">← 홈</Link>
              </Button>
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                주식
              </h1>
              <p className="text-muted-foreground">
                종목별 목표 비중과 보유 수량을 관리하세요.
              </p>
            </div>
            <CurrencyToggle />
          </header>

          <StockTargetSection />
          <StockHoldingsSection />
        </div>
      </main>
    </CurrencyProvider>
  )
}
