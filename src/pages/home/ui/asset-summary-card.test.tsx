import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AssetTypeMeta } from '@/entities/asset'
import type { AssetSummary } from '@/entities/asset-summary'
import type { Currency } from '@/shared/lib/currency'
import { CurrencyProvider } from '@/shared/lib/currency-provider'
import { AssetSummaryCard } from './asset-summary-card'

const mocks = vi.hoisted(() => ({
  useAssetSummary: vi.fn(),
  upsert: vi.fn(),
}))

vi.mock('@/entities/asset-summary', () => ({
  useAssetSummary: mocks.useAssetSummary,
  assetSummaryRepo: { upsert: mocks.upsert },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

const stockType: AssetTypeMeta = {
  value: 'stock',
  label: '주식',
  description: '국내·해외 상장 주식',
}

function setSummary(amount: number | null, currency: Currency = 'USD') {
  if (amount === null) {
    mocks.useAssetSummary.mockReturnValue(undefined)
  } else {
    const summary: AssetSummary = {
      type: 'stock',
      amount,
      currency,
      updatedAt: 0,
    }
    mocks.useAssetSummary.mockReturnValue(summary)
  }
}

function renderCard() {
  return render(
    <CurrencyProvider>
      <AssetSummaryCard type={stockType} />
    </CurrencyProvider>,
  )
}

describe('AssetSummaryCard', () => {
  beforeEach(() => {
    mocks.useAssetSummary.mockReset()
    mocks.upsert.mockReset()
  })

  it('타입 라벨과 설명을 노출', () => {
    setSummary(null)
    renderCard()
    expect(screen.getByText('주식')).toBeInTheDocument()
    expect(screen.getByText('국내·해외 상장 주식')).toBeInTheDocument()
  })

  it('항상 input을 표시', () => {
    setSummary(null)
    renderCard()
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('저장된 금액이 input에 반영', () => {
    setSummary(1234)
    renderCard()
    expect(screen.getByRole('spinbutton')).toHaveValue(1234)
  })

  it('blur 시 전역 통화로 repo.upsert 호출', async () => {
    const user = userEvent.setup()
    setSummary(null)
    renderCard()

    const input = screen.getByRole('spinbutton')
    await user.type(input, '500')
    await user.tab()

    expect(mocks.upsert).toHaveBeenCalledWith({
      type: 'stock',
      amount: 500,
      currency: 'USD',
    })
  })

  it('변경 없이 blur 하면 upsert 호출하지 않음', async () => {
    const user = userEvent.setup()
    setSummary(1000, 'USD')
    renderCard()

    const input = screen.getByRole('spinbutton')
    await user.click(input)
    await user.tab()

    expect(mocks.upsert).not.toHaveBeenCalled()
  })
})
