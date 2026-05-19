import { ASSET_TYPES } from '@/entities/asset'
import { CurrencyProvider } from '@/shared/lib/currency-provider'
import { CurrencyToggle } from '@/shared/ui/currency-toggle'
import { AssetSummaryCard } from './asset-summary-card'
import { TargetAllocationSection } from './target-allocation-section'

export function HomePage() {
  return (
    <CurrencyProvider>
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <header className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-4xl font-semibold tracking-tight">
                mekook
              </h1>
              <p className="text-muted-foreground">자산별 금액을 입력하세요.</p>
            </div>
            <CurrencyToggle />
          </header>

          <TargetAllocationSection />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ASSET_TYPES.map((type) => (
              <AssetSummaryCard key={type.value} type={type} />
            ))}
          </section>
        </div>
      </main>
    </CurrencyProvider>
  )
}
