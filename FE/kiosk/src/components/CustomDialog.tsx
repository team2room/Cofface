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
  subText?: string
  icon?: string
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
  showKeypad?: boolean
  hideConfirm?: boolean
  hideCancel?: boolean
}

export default function CustomDialog({
  open,
  onOpenChange,
  title,
  description,
  subText,
  icon,
  cancelText = '취소',
  confirmText = '확인',
  onCancel,
  onConfirm,
  showKeypad = false,
  hideConfirm = false,
  hideCancel = false,
}: CommonAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl p-12 pb-16 text-center">
        {title && (
          <>
            <AlertDialogTitle></AlertDialogTitle>
            <Text
              variant="title4"
              weight="extrabold"
              className="text-center"
              color="lightBlack"
            >
              {title}
            </Text>
          </>
        )}
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
            <Text variant="body3" weight="bold" color="lightBlack">
              {subText}
            </Text>
            {showKeypad && <NumKeyPad />}
          </AlertDialogDescription>
        )}

        <AlertDialogFooter className="w-[576px] mx-auto flex gap-8 justify-center">
          {!hideCancel && (
            <CustomButton
              text={cancelText}
              variant="cancle"
              onClick={onCancel}
            />
          )}
          {!hideConfirm && (
            <CustomButton
              text={confirmText}
              variant="main"
              onClick={onConfirm}
            />
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
