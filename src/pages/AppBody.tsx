import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  font-family: Poppins;
  position: relative;
  width: 620px;
  max-width: 100%;
  padding: 28px 34px;
  min-height: 570px;
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  margin-right: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px
    margin-right: auto;
    margin-left: auto;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
  `};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
