import { CurrencyProvider } from '@/shared/lib/currency-provider'
import { CurrencyToggle } from '@/shared/ui/currency-toggle'
import { TargetAllocationSection } from './ui/target-allocation-section'
import { PortfolioSummary } from './ui/portfolio-summary'
import { PortfolioChartsSection } from './ui/portfolio-charts-section'
import { PortfolioAssets } from './ui/portfolio-assets'

export function PortfolioPage() {
  return (
    <CurrencyProvider>
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                mekook
              </h1>
              <p className="text-muted-foreground">
                보유 자산과 목표 비중을 비교해 리밸런싱 금액을 확인하세요.
              </p>
            </div>
            <CurrencyToggle />
          </header>

          <TargetAllocationSection />
          <PortfolioSummary />
          <PortfolioChartsSection />
          <PortfolioAssets />
        </div>
      </main>
    </CurrencyProvider>
  )
}
