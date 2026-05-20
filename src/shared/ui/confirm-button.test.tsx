import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConfirmButton } from '@/shared/ui/confirm-button'

describe('ConfirmButton', () => {
  it('확인 클릭 시 onConfirm 호출', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmButton onConfirm={onConfirm}>삭제</ConfirmButton>)

    await user.click(screen.getByRole('button', { name: '삭제' }))
    await user.click(screen.getByRole('button', { name: '확인' }))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('취소 클릭 시 onConfirm 미호출', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmButton onConfirm={onConfirm}>삭제</ConfirmButton>)

    await user.click(screen.getByRole('button', { name: '삭제' }))
    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(onConfirm).not.toHaveBeenCalled()
  })
})
