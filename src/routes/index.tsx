import { createFileRoute } from '@tanstack/react-router'
import { assetRepo } from '@/entities/asset'
import { PortfolioPage } from '@/pages/portfolio'

export const Route = createFileRoute('/')({
  // IndexedDB는 브라우저 전용 — 서버(SSR) 환경에서는 skip
  loader: () =>
    typeof indexedDB !== 'undefined'
      ? assetRepo.ensureCashAsset('KRW')
      : undefined,
  component: PortfolioPage,
})
