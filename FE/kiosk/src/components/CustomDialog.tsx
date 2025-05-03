import { Text } from '@/styles/typography'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { ReactNode } from 'react'
import CustomButton from './CustomButton'
import NumKeyPad from '@/features/userLogin/components/NumKeyPad'

interface CommonAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  icon?: string
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
  showKeypad?: boolean
}

export default function CustomDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  cancelText = '취소',
  confirmText = '확인',
  onCancel,
  onConfirm,
  showKeypad = false,
}: CommonAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl p-12 pb-16 text-center">
        {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
        {description && (
          <AlertDialogDescription className="mt-28 mb-28 whitespace-pre-line leading-10">
            <Text variant="title3" weight="extrabold" color="lightBlack">
              {description}
            </Text>
            {icon && (
              <div className="my-16 flex justify-center">
                <img
                  src={icon}
                  alt="alert"
                  className="w-80"
                  draggable={false}
                />
              </div>
            )}
            {showKeypad && <NumKeyPad />}
          </AlertDialogDescription>
        )}

        <AlertDialogFooter className="flex gap-3 justify-center">
          <CustomButton text={cancelText} variant="cancle" onClick={onCancel} />
          <CustomButton text={confirmText} variant="main" onClick={onConfirm} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
