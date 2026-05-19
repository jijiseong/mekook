import { createFileRoute } from '@tanstack/react-router'
import { StocksPage } from '@/pages/stocks'

export const Route = createFileRoute('/stocks')({
  component: StocksPage,
})
