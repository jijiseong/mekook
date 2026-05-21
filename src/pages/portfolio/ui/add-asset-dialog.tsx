import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { assetRepo } from '@/entities/asset'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { DEFAULT_CURRENCY } from '@/shared/lib/currency'

interface Props {
  existingSymbols: string[]
}

export function AddAssetDialog({ existingSymbols }: Props) {
  const currency = DEFAULT_CURRENCY
  const [open, setOpen] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setSymbol('')
    setName('')
    setError(null)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const normalized = symbol.trim().toUpperCase()
    if (!normalized) {
      setError('종목 코드를 입력하세요.')
      return
    }
    if (existingSymbols.includes(normalized)) {
      setError('이미 추가된 종목입니다.')
      return
    }
    void (async () => {
      await assetRepo.create({
        type: 'stock',
        symbol: normalized,
        name: name.trim() || normalized,
        currency,
      })
      reset()
      setOpen(false)
    })()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          종목 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>종목 추가</DialogTitle>
          <DialogDescription>종목 코드와 이름을 입력하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="asset-symbol">종목 코드</FieldLabel>
              <Input
                id="asset-symbol"
                placeholder="예: AAPL, 005930"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value)
                  setError(null)
                }}
                aria-invalid={error ? true : undefined}
                autoFocus
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-name">이름 (선택)</FieldLabel>
              <Input
                id="asset-name"
                placeholder="예: Apple Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button type="submit">추가</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
