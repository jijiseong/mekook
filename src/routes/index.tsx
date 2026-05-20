import { createFileRoute } from '@tanstack/react-router'
import { assetRepo } from '@/entities/asset'
import { PortfolioPage } from '@/pages/portfolio'

export const Route = createFileRoute('/')({
  loader: () => assetRepo.ensureCashAsset('KRW'),
  component: PortfolioPage,
})
