import { useEffect } from 'react'
import { assetRepo } from '@/entities/asset'
import { TargetAllocationSection } from './ui/target-allocation-section'
import { PortfolioChartsSection } from './ui/portfolio-charts-section'
import { AssetInputSection } from './ui/asset-input-section'
import { RebalanceSection } from './ui/rebalance-section'

export function PortfolioPage() {
  useEffect(() => {
    void assetRepo.ensureCashAsset('USD')
  }, [])

  return (
    <main className="min-h-screen px-6 py-32 pb-72">
      <div className="mx-auto flex max-w-5xl flex-col gap-40">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            PORTFOLIO
          </h1>
          <p className="text-muted-foreground">
            리밸런싱 계산 귀찮을 때 쓰세요 ㅋ.
          </p>
        </header>
        <TargetAllocationSection />
        <AssetInputSection />
        <PortfolioChartsSection />
        <RebalanceSection />
      </div>
    </main>
  )
}
