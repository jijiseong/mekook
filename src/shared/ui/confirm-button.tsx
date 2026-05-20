import * as React from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'

type ConfirmButtonProps = {
  children: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  confirmText?: React.ReactNode
  cancelText?: React.ReactNode
  onConfirm: () => void
  confirmVariant?: React.ComponentProps<typeof Button>['variant']
  disabled?: boolean
} & Pick<
  React.ComponentProps<typeof Button>,
  'variant' | 'size' | 'className' | 'aria-label'
>

function ConfirmButton({
  children,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  confirmVariant,
  disabled,
  variant,
  size,
  className,
  'aria-label': ariaLabel,
}: ConfirmButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label={ariaLabel}
          disabled={disabled}
        >
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? '정말 진행하시겠습니까?'}
          </AlertDialogTitle>
          {description !== null && (
            <AlertDialogDescription>
              {description ?? '이 작업을 진행하시겠습니까?'}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText ?? '취소'}</AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} onClick={onConfirm}>
            {confirmText ?? '확인'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmButton }
