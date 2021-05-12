import React from 'react'

import {Modal, PopupItem} from 'components'
import { PopupContent } from 'state/application/actions'

interface PlainPopupProps {
  isOpen: boolean
  onDismiss: () => void
  content: PopupContent
  removeAfterMs: number
  hideClose?: boolean | undefined
}
export function PlainPopup({ isOpen, onDismiss, content, removeAfterMs, hideClose }: PlainPopupProps) {
  return (
    <>
      {
        <>
          <Modal isOpen={isOpen} onDismiss={onDismiss}>
            <PopupItem key={''} content={content} popKey={''} removeAfterMs={removeAfterMs} hideClose={true} />
          </Modal>
        </>
      }
    </>
  )
}
