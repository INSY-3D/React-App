import { type PropsWithChildren } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'

type BottomSheetProps = PropsWithChildren<{
  open: boolean
  onClose: () => void
  height?: number | string
}>

export default function BottomSheet({ open, onClose, height = '60%', children }: BottomSheetProps) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          height,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ p: 2 }}>{children}</Box>
    </Drawer>
  )
}


